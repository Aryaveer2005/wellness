import type { Metadata } from "next";
import { ChatView } from "@/components/chat/chat-view";

export const metadata: Metadata = {
  title: "AI Companion",
  description: "Talk things through with a calm, judgement-free AI companion. Not therapy — a self-help tool.",
};

export default function ChatPage() {
  return <ChatView />;
}
