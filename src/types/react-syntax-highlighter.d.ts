/**
 * Type declarations for react-syntax-highlighter
 * This file provides basic type declarations for the library to resolve TypeScript errors
 */

declare module "react-syntax-highlighter" {
	import { ReactNode } from "react";

	export interface SyntaxHighlighterProps {
		language?: string;
		style?: any;
		customStyle?: React.CSSProperties;
		codeTagProps?: React.HTMLAttributes<HTMLElement>;
		useInlineStyles?: boolean;
		showLineNumbers?: boolean;
		startingLineNumber?: number;
		lineNumberStyle?: React.CSSProperties;
		wrapLines?: boolean;
		lineProps?: any;
		renderer?: any;
		PreTag?: React.ComponentType<any> | keyof JSX.IntrinsicElements;
		CodeTag?: React.ComponentType<any> | keyof JSX.IntrinsicElements;
		children: string | ReactNode;
	}

	export const Prism: React.FC<SyntaxHighlighterProps>;
	export const Light: React.FC<SyntaxHighlighterProps>;
}

declare module "react-syntax-highlighter/dist/esm/styles/prism" {
	export const atomDark: any;
	export const prism: any;
	export const dark: any;
	export const okaidia: any;
	export const tomorrow: any;
	export const solarizedlight: any;
	export const vs: any;
	export const vscDarkPlus: any;
}

declare module "react-syntax-highlighter/dist/esm/styles/hljs" {
	export const docco: any;
	export const dark: any;
	export const github: any;
	export const monokai: any;
	export const solarized: any;
	export const vs: any;
}
