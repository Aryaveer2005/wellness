"use client";

/**
 * Microphone capture with simple voice-activity detection for voice mode.
 * - Adapts to the room's background noise, starts when you speak, ends after a short pause.
 * - Keeps a little audio from just before you started, so first words aren't clipped.
 * - Produces a 16 kHz mono 16-bit WAV (what the speech-to-text model expects).
 * Audio never leaves the browser except the finished turn sent to our own /api/stt.
 */

type Options = {
  onLevel?: (level: number) => void; // 0…1, for the orb animation
  onSpeechStart?: () => void;
  onUtterance: (wav: Blob, seconds: number) => void;
  silenceMs?: number;
  minSpeechMs?: number;
  maxMs?: number;
};

const TARGET_RATE = 16_000;
const FRAME = 2048;

export class VoiceRecorder {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private node: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private armed = false;
  private opts: Options | null = null;

  private noise = 0.01;
  private speaking = false;
  private loudFrames = 0;
  private silentMs = 0;
  private speechMs = 0;
  private chunks: Float32Array[] = [];
  private preroll: Float32Array[] = [];

  /** Ask for the microphone. Throws if permission is denied / no mic. */
  async start() {
    if (this.ctx) return;
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
    });
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AC();
    this.source = this.ctx.createMediaStreamSource(this.stream);
    this.node = this.ctx.createScriptProcessor(FRAME, 1, 1);
    this.node.onaudioprocess = (e) => this.onFrame(e.inputBuffer.getChannelData(0));
    this.source.connect(this.node);
    // Must be connected to run; the output is silent (we never write to it).
    this.node.connect(this.ctx.destination);
  }

  /** Start listening for one turn. */
  listen(opts: Options) {
    this.opts = opts;
    this.reset();
    this.armed = true;
    if (this.ctx?.state === "suspended") void this.ctx.resume();
  }

  /** Stop listening (e.g. while the companion is speaking) without releasing the mic. */
  pause() {
    this.armed = false;
    this.reset();
  }

  /** Release the microphone completely. */
  stop() {
    this.armed = false;
    this.node?.disconnect();
    this.source?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    void this.ctx?.close().catch(() => {});
    this.ctx = this.node = this.source = this.stream = null;
  }

  private reset() {
    this.speaking = false;
    this.loudFrames = 0;
    this.silentMs = 0;
    this.speechMs = 0;
    this.chunks = [];
    this.preroll = [];
  }

  private onFrame(input: Float32Array) {
    if (!this.ctx) return;
    let sum = 0;
    for (let i = 0; i < input.length; i++) sum += input[i] * input[i];
    const rms = Math.sqrt(sum / input.length);
    this.opts?.onLevel?.(Math.min(1, rms * 12));
    if (!this.armed || !this.opts) return;

    const frameMs = (input.length / this.ctx.sampleRate) * 1000;
    const threshold = Math.max(0.012, this.noise * 3.2);
    const copy = new Float32Array(input);

    if (!this.speaking) {
      // Track background noise while quiet.
      if (rms < threshold) this.noise = this.noise * 0.95 + rms * 0.05;
      this.preroll.push(copy);
      if (this.preroll.length > Math.ceil(350 / frameMs)) this.preroll.shift();
      this.loudFrames = rms > threshold ? this.loudFrames + 1 : 0;
      if (this.loudFrames >= 2) {
        this.speaking = true;
        this.chunks = [...this.preroll];
        this.preroll = [];
        this.opts.onSpeechStart?.();
      }
      return;
    }

    this.chunks.push(copy);
    this.speechMs += frameMs;
    this.silentMs = rms < threshold * 0.8 ? this.silentMs + frameMs : 0;
    const { silenceMs = 1100, minSpeechMs = 400, maxMs = 30_000 } = this.opts;

    if ((this.silentMs >= silenceMs && this.speechMs >= minSpeechMs) || this.speechMs >= maxMs) {
      const done = this.opts.onUtterance;
      const audio = this.chunks;
      const rate = this.ctx.sampleRate;
      this.armed = false;
      this.reset();
      const pcm = downsample(concat(audio), rate, TARGET_RATE);
      done(toWav(pcm, TARGET_RATE), pcm.length / TARGET_RATE);
    } else if (this.silentMs >= silenceMs && this.speechMs < minSpeechMs) {
      // A cough or click — ignore and keep listening.
      this.reset();
    }
  }
}

function concat(parts: Float32Array[]) {
  const out = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

/** Average-based decimation — clean enough for speech recognition. */
function downsample(input: Float32Array, from: number, to: number) {
  if (from === to) return input;
  const ratio = from / to;
  const out = new Float32Array(Math.floor(input.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(input.length, Math.floor((i + 1) * ratio));
    let s = 0;
    for (let j = start; j < end; j++) s += input[j];
    out[i] = s / Math.max(1, end - start);
  }
  return out;
}

function toWav(samples: Float32Array, rate: number) {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buf);
  const w = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF");
  v.setUint32(4, 36 + samples.length * 2, true);
  w(8, "WAVE");
  w(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  w(36, "data");
  v.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buf], { type: "audio/wav" });
}
