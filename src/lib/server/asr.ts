import "server-only";
import path from "node:path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { redact, serverEnv } from "./env";

/**
 * Speech-to-text for voice mode — NVIDIA Parakeet (Riva ASR API) on NVCF, gRPC.
 * Input: 16-bit mono PCM (we send 16 kHz from the browser). Output: punctuated text.
 * Audio is processed in memory for this one request and never stored or logged.
 */

type RecognizeRequest = {
  config: {
    encoding: number;
    sample_rate_hertz: number;
    language_code: string;
    max_alternatives: number;
    enable_automatic_punctuation: boolean;
    audio_channel_count: number;
  };
  audio: Buffer;
};
type RecognizeResponse = { results?: { alternatives?: { transcript?: string; confidence?: number }[] }[] };
type AsrClient = grpc.Client & {
  Recognize(req: RecognizeRequest, md: grpc.Metadata, opts: grpc.CallOptions, cb: (err: grpc.ServiceError | null, res: RecognizeResponse) => void): void;
};

let client: AsrClient | null = null;

function getClient(): AsrClient {
  if (client) return client;
  const def = protoLoader.loadSync("riva/proto/riva_asr.proto", {
    includeDirs: [path.join(process.cwd(), "src", "lib", "server", "proto")],
    keepCase: true,
    longs: Number,
    enums: Number,
    defaults: true,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pkg = grpc.loadPackageDefinition(def) as any;
  const Ctor = pkg.nvidia.riva.asr.RivaSpeechRecognition as new (addr: string, creds: grpc.ChannelCredentials) => AsrClient;
  client = new Ctor("grpc.nvcf.nvidia.com:443", grpc.credentials.createSsl());
  return client;
}

export const isAsrConfigured = () => !!serverEnv.nvidiaAsrKey();

/** PCM16 mono → transcript ("" if nothing was understood). */
export function transcribe(pcm: Buffer, sampleRate: number): Promise<string> {
  const key = serverEnv.nvidiaAsrKey();
  if (!key) return Promise.reject(new Error("asr not configured"));
  const md = new grpc.Metadata();
  md.set("function-id", serverEnv.nvidiaAsrFunctionId());
  md.set("authorization", `Bearer ${key}`);
  return new Promise((resolve, reject) => {
    getClient().Recognize(
      {
        config: {
          encoding: 1, // LINEAR_PCM
          sample_rate_hertz: sampleRate,
          language_code: serverEnv.nvidiaAsrLanguage(),
          max_alternatives: 1,
          enable_automatic_punctuation: true,
          audio_channel_count: 1,
        },
        audio: pcm,
      },
      md,
      { deadline: Date.now() + 30_000 },
      (err, res) => {
        if (err) return reject(new Error(redact(`asr ${err.code}: ${err.details}`)));
        const text = (res.results ?? [])
          .map((r) => r.alternatives?.[0]?.transcript ?? "")
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        resolve(text);
      }
    );
  });
}
