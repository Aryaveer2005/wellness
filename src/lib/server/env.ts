import "server-only";

/**
 * Server-only access to secrets. Nothing in this folder may be imported by
 * client code — the "server-only" import above makes the build fail if it is.
 * Keys live in .env.local (never committed). Never prefix them with NEXT_PUBLIC_.
 */

const clean = (v: string | undefined) => {
  const s = v?.trim();
  return s ? s : undefined;
};

export const serverEnv = {
  // NVIDIA (build.nvidia.com)
  nvidiaImageKey: () => clean(process.env.NVIDIA_IMAGE_API_KEY),
  nvidiaGuardKey: () => clean(process.env.NVIDIA_GUARD_API_KEY),
  nvidiaTtsKey: () => clean(process.env.NVIDIA_TTS_API_KEY),
  // Chat replies: own key if given, otherwise the guard key (same NVIDIA account).
  nvidiaChatKey: () => clean(process.env.NVIDIA_CHAT_API_KEY) ?? clean(process.env.NVIDIA_GUARD_API_KEY),
  nvidiaChatModel: () => clean(process.env.NVIDIA_CHAT_MODEL) ?? "nvidia/nemotron-3.5-lightning-30b-a3b",
  nvidiaGuardModel: () => clean(process.env.NVIDIA_GUARD_MODEL) ?? "nvidia/llama-3.1-nemoguard-8b-topic-control",
  nvidiaImageModel: () => clean(process.env.NVIDIA_IMAGE_MODEL) ?? "black-forest-labs/flux.2-klein-4b",
  nvidiaTtsFunctionId: () => clean(process.env.NVIDIA_TTS_FUNCTION_ID) ?? "ddacc747-1269-4fab-bfd9-8f593dead106",
  nvidiaTtsVoice: () => clean(process.env.NVIDIA_TTS_VOICE) ?? "Chatterbox-Multilingual.en-US.Male",
  // Speech-to-text (voice mode): own key if given, otherwise the voice (TTS) key.
  nvidiaAsrKey: () => clean(process.env.NVIDIA_ASR_API_KEY) ?? clean(process.env.NVIDIA_TTS_API_KEY),
  // Parakeet TDT 0.6B v2 (English, punctuation). Multilingual alternative: 71203149-d3b7-4460-8231-1be2543a1fca
  nvidiaAsrFunctionId: () => clean(process.env.NVIDIA_ASR_FUNCTION_ID) ?? "d3fe9151-442b-4204-a70d-5fcc597fd610",
  nvidiaAsrLanguage: () => clean(process.env.NVIDIA_ASR_LANGUAGE) ?? "en-US",

  // Optional Anthropic fallback for chat / hints
  anthropicKey: () => clean(process.env.ANTHROPIC_API_KEY),
  anthropicModel: () => clean(process.env.ANTHROPIC_MODEL) ?? "claude-sonnet-5-5",
};

/** Strip anything that looks like a key before logging an error message. */
export function redact(message: unknown): string {
  const s = message instanceof Error ? message.message : String(message);
  return s
    .replace(/nvapi-[\w-]+/g, "nvapi-***")
    .replace(/sk-ant-[\w-]+/g, "sk-ant-***")
    .replace(/AIza[\w-]{20,}/g, "AIza***")
    .slice(0, 300);
}
