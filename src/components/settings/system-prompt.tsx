"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import { useHasMounted } from "@/utils/utils";
import { ChatOptions } from "../chat/chat-options";
import { Textarea } from "../ui/shadcn/textarea";
import { Label } from "@/components/ui/shadcn/label";
import { useChatStore } from "@/store/chatStore";

export interface SystemPromptProps {
  chatOptions: ChatOptions;
  setChatOptions: (options: ChatOptions) => void;
}
export default function SystemPrompt({
  chatOptions,
  setChatOptions,
}: SystemPromptProps) {
  const hasMounted = useHasMounted();
  const { currentChatId, getSystemPrompt, setSystemPrompt } = useChatStore();

  // Get the system prompt for current chat or global default
  const systemPromptValue = getSystemPrompt(currentChatId);
  const [text, setText] = useState<string>(systemPromptValue || "");
  const [debouncedText] = useDebounce(text, 500);

  // Update the text state when the current chat changes
  useEffect(() => {
    if (hasMounted) {
      const promptForCurrentChat = getSystemPrompt(currentChatId);
      setText(promptForCurrentChat || "");
    }
  }, [hasMounted, currentChatId, getSystemPrompt]);

  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    if (debouncedText !== systemPromptValue) {
      // Save system prompt for the current chat if it exists
      if (currentChatId) {
        setSystemPrompt(currentChatId, debouncedText);
      }

      // Also update the global default system prompt
      setChatOptions({ ...chatOptions, systemPrompt: debouncedText });
      toast.success("系统提示已更新", { duration: 1000 });
    }
  }, [hasMounted, debouncedText, systemPromptValue, currentChatId, chatOptions, setChatOptions, setSystemPrompt]);

  return (
    <div className="grid w-full gap-1.5 px-2">
      <Label htmlFor="system-prompt">系统提示</Label>
      <Textarea
        id="system-prompt"
        className="resize-none bg-white/20 dark:bg-card/35 max-h-40 sm:max-h-48 md:max-h-56 lg:max-h-64"
        autoComplete="off"
        rows={4}
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
        name="systemPrompt"
        placeholder="你是一个有帮助的助手。"
      />
    </div>
  );
}
