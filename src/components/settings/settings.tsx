"use client";

import ClearChatsButton from "./settings-clear-chats";
import SystemPrompt, { SystemPromptProps } from "./system-prompt";
import { Input } from "../ui/shadcn/input";
import { Slider } from "@/components/ui/shadcn/slider";
import { Label } from "@/components/ui/shadcn/label";
import { ChatOptions } from "../chat/chat-options";
import { useHasMounted } from "@/utils/utils";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "../ui/shadcn/button";

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
        {theme === "light" ? (
          <MoonIcon className="w-4 h-4" />
        ) : (
          <SunIcon className="w-4 h-4" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
};


const TemperatureSlider = ({
  chatOptions,
  setChatOptions,
}: SystemPromptProps) => {
  const handleTemperatureChange = (value: number[]) => {
    setChatOptions({
      ...chatOptions,
      temperature: value[0],
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let temp = parseFloat(e.target.value);
    if (isNaN(temp)) temp = 0; // Handle potential NaN
    if (temp < 0) temp = 0;
    if (temp > 2) temp = 2;
    setChatOptions({
      ...chatOptions,
      temperature: temp,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="temperature">Temperature</Label>
          <Input
            id="temperature-value"
            type="number"
            className="w-20 h-8 text-right" // Adjusted width and height
            value={(chatOptions.temperature ?? 0).toFixed(1)} // Provide default 0 and format
            onChange={handleInputChange}
            min={0}
            max={2}
            step={0.1}
          />
        </div>
        <Slider
          id="temperature"
          min={0}
          max={2}
          step={0.1}
          value={[chatOptions.temperature ?? 0]} // Provide default 0
          onValueChange={handleTemperatureChange} // Use onValueChange for shadcn Slider
          className="w-full" // Use w-full for better responsiveness
        />
      </div>
    </div>
  );
};

export default function Settings({
  chatOptions,
  setChatOptions,
}: SystemPromptProps) {
  return (
    <div className="space-y-6 pt-4">
      <SystemPrompt chatOptions={chatOptions} setChatOptions={setChatOptions} />
      <TemperatureSlider
        chatOptions={chatOptions}
        setChatOptions={setChatOptions}
      />
      <SettingsThemeToggle />
      <ClearChatsButton />
    </div>
  );
}
