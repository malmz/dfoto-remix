import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react';
import type { LinksFunction, MetaFunction } from '@remix-run/node';
import styles from './globals.css?url';
import { TooltipProvider } from './components/ui/tooltip';
import { cn } from './lib/utils';
import { ThemeProvider } from 'next-themes';
import { Toaster } from './components/ui/sonner';

export const meta: MetaFunction = () => [{ title: 'DFoto' }];

export const links: LinksFunction = () => [
	{ rel: 'preconnect', href: 'https://rsms.me/' },
	{ rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
	{ rel: 'stylesheet', href: styles },
];

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute='class'
			defaultTheme='system'
			enableSystem
			disableTransitionOnChange
		>
			<TooltipProvider>{children}</TooltipProvider>
		</ThemeProvider>
	);
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en' suppressHydrationWarning>
			<head>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<Meta />
				<Links />
			</head>
			<body
				className={cn(
					'flex min-h-screen flex-col bg-background font-sans antialiased',
				)}
			>
				<Providers>{children}</Providers>
				<Toaster></Toaster>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}
