import { ThemeProvider } from "@/providers/theme-provider";
import type { Metadata } from "next";

import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const runtime = "edge"; // 'nodejs' (default) | 'edge'

export const metadata: Metadata = {
    title: "计算社会科学与国家治理实验室",
    description: "vLLM chatbot web interface",
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ThemeProvider attribute="class" defaultTheme="light">
                    {children}
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
