"use client";

// Chat history storage (privacy first):
//  - default: sessionStorage — gone when the tab/browser closes.
//  - if the user turned on "Save chat history" in Settings: localStorage on this device.

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Non-AI system replies get a special look and are not sent back to the model. */
  kind?: "crisis" | "offline" | "limit" | "error" | "offtopic";
};

const SESSION_KEY = "showup.chat.session";
const SAVED_KEY = "showup.chat.saved";

export function loadChat(persist: boolean): ChatMessage[] {
  try {
    const raw = (persist ? window.localStorage : window.sessionStorage).getItem(persist ? SAVED_KEY : SESSION_KEY);
    if (raw) return JSON.parse(raw) as ChatMessage[];
    // Fall back to this session's chat if the user just turned saving on.
    if (persist) {
      const s = window.sessionStorage.getItem(SESSION_KEY);
      if (s) return JSON.parse(s) as ChatMessage[];
    }
  } catch {
    /* storage unavailable */
  }
  return [];
}

export function saveChat(messages: ChatMessage[], persist: boolean) {
  try {
    const value = JSON.stringify(messages.slice(-200));
    window.sessionStorage.setItem(SESSION_KEY, value);
    if (persist) window.localStorage.setItem(SAVED_KEY, value);
  } catch {
    /* storage unavailable — chat still works for this page view */
  }
}

/** Removes the on-device saved chat (used by Settings and "clear conversation"). */
export function clearSavedChat({ includeSession = false } = {}) {
  try {
    window.localStorage.removeItem(SAVED_KEY);
    if (includeSession) window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function getSavedChat(): ChatMessage[] {
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}
