"use client";

import { Label } from "@/components/ui/shadcn/label";
import { useHasMounted } from "@/utils/utils";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "../ui/shadcn/button";
import ClearChatsButton from "./settings-clear-chats";
import SystemPrompt, { type SystemPromptProps } from "./system-prompt";

const SettingsThemeToggle = () => {
	const hasMounted = useHasMounted();
	const { setTheme, theme } = useTheme();

	if (!hasMounted) {
		return null;
	}

	const nextTheme = theme === "light" ? "dark" : "light";

	return (
		<div className="flex items-center justify-between px-2">
			<Label htmlFor="theme-toggle">外观</Label>
			<Button
				id="theme-toggle"
				className="gap-2"
				size="icon"
				variant="ghost"
				onClick={() => setTheme(nextTheme)}
			>
				{theme === "light" ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
				<span className="sr-only">Toggle theme</span>
			</Button>
		</div>
	);
};


export default function Settings({ chatOptions, setChatOptions }: SystemPromptProps) {
	return (
		<div className="space-y-6 pt-4">
			<SystemPrompt chatOptions={chatOptions} setChatOptions={setChatOptions} />
			<SettingsThemeToggle />
			<ClearChatsButton />
		</div>
	);
}
