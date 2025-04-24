"use client";

import * as React from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/shadcn/dialog";
import { TrashIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

import { useHasMounted } from "@/utils/utils";
import { Button } from "@/components/ui/shadcn/button";
import { useChatStore } from "@/store/chat-store";

export default function ClearChatsButton() {
  const hasMounted = useHasMounted();
  const router = useRouter();
  const { clearAllChats } = useChatStore();

  if (!hasMounted) {
    return null;
  }

  // Check if there are any chats in localStorage
  const chatExists = Object.keys(localStorage).some((key) =>
    key.startsWith("chat_")
  );

  const disabled = !chatExists;

  const handleClearChats = () => {
    clearAllChats();
    router.push("/");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="justify-start gap-2 w-full h-9 px-3"
          disabled={disabled}
        >
          <TrashIcon className="w-4 h-4" />
          <span>清除聊天</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认操作</DialogTitle>
          <DialogDescription>
            确定要删除所有聊天记录吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">取消</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleClearChats}>
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
