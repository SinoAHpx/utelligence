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
} from "@/components/ui/dialog";
import { TrashIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

import { useHasMounted } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function ClearChatsButton() {
  const hasMounted = useHasMounted();
  const router = useRouter();

  if (!hasMounted) {
    return null;
  }

  const chats = Object.keys(localStorage).filter((key) =>
    key.startsWith("chat_")
  );

  const disabled = chats.length === 0;

  const clearChats = () => {
    chats.forEach((key) => {
      localStorage.removeItem(key);
    });
    window.dispatchEvent(new Event("storage"));
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
          <Button variant="destructive" onClick={() => clearChats()}>
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
