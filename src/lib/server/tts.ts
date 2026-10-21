import "server-only";
import path from "node:path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { redact, serverEnv } from "./env";

/**
 * Chatterbox Multilingual TTS (Resemble AI) hosted on NVIDIA NVCF — gRPC (Riva TTS API).
 * Returns a WAV file (24 kHz, mono, 16-bit PCM). Server-side only.
 *
 * Chatterbox produces ~15 s of audio per request at most, so longer text is split
 * into sentence-sized chunks, synthesised in parallel, and joined.
 */

const SAMPLE_RATE = 24_000;
const MAX_CHUNK_CHARS = 220;

type SynthRequest = { text: string; language_code: string; encoding: number; sample_rate_hz: number; voice_name: string };
type SynthResponse = { audio: Buffer };
type RivaClient = grpc.Client & {
  Synthesize(req: SynthRequest, md: grpc.Metadata, opts: grpc.CallOptions, cb: (err: grpc.ServiceError | null, res: SynthResponse) => void): void;
};

let client: RivaClient | null = null;

function getClient(): RivaClient {
  if (client) return client;
  const def = protoLoader.loadSync("riva/proto/riva_tts.proto", {
    includeDirs: [path.join(process.cwd(), "src", "lib", "server", "proto")],
    keepCase: true,
    longs: Number,
    enums: Number,
    defaults: true,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pkg = grpc.loadPackageDefinition(def) as any;
  const Ctor = pkg.nvidia.riva.tts.RivaSpeechSynthesis as new (addr: string, creds: grpc.ChannelCredentials) => RivaClient;
  client = new Ctor("grpc.nvcf.nvidia.com:443", grpc.credentials.createSsl());
  return client;
}

export const isTtsConfigured = () => !!serverEnv.nvidiaTtsKey();

function synthesizeChunk(text: string): Promise<Buffer> {
  const key = serverEnv.nvidiaTtsKey();
  if (!key) return Promise.reject(new Error("tts not configured"));
  const md = new grpc.Metadata();
  md.set("function-id", serverEnv.nvidiaTtsFunctionId());
  md.set("authorization", `Bearer ${key}`);
  return new Promise((resolve, reject) => {
    getClient().Synthesize(
      { text, language_code: "en-US", encoding: 1 /* LINEAR_PCM */, sample_rate_hz: SAMPLE_RATE, voice_name: serverEnv.nvidiaTtsVoice() },
      md,
      { deadline: Date.now() + 30_000 },
      (err, res) => (err ? reject(new Error(redact(`tts ${err.code}: ${err.details}`))) : resolve(Buffer.from(res.audio)))
    );
  });
}

/** Split into sentence groups under MAX_CHUNK_CHARS. */
export function chunkText(text: string): string[] {
  const sentences = text.replace(/\s+/g, " ").trim().match(/[^.!?…]+[.!?…]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if ((cur + s).length > MAX_CHUNK_CHARS && cur) {
      chunks.push(cur.trim());
      cur = "";
    }
    cur += s.length > MAX_CHUNK_CHARS ? s.slice(0, MAX_CHUNK_CHARS) : s;
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
}

function wav(pcm: Buffer): Buffer {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20); // PCM
  h.writeUInt16LE(1, 22); // mono
  h.writeUInt32LE(SAMPLE_RATE, 24);
  h.writeUInt32LE(SAMPLE_RATE * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

const pause = (ms: number) => Buffer.alloc(Math.round((SAMPLE_RATE * ms) / 1000) * 2);

/** Text → WAV. Chunks run in parallel; a short pause is placed between them. */
export async function synthesizeSpeech(text: string): Promise<Buffer> {
  const chunks = chunkText(text).slice(0, 4);
  const pcm = await Promise.all(chunks.map(synthesizeChunk));
  const joined: Buffer[] = [];
  pcm.forEach((p, i) => {
    joined.push(p);
    if (i < pcm.length - 1) joined.push(pause(280));
  });
  return wav(Buffer.concat(joined));
}
