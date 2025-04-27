"use client";

import React from "react";
import ChatPage from "@/components/chat/chat-page";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChatPage chatId={id} />;
}
