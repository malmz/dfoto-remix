import type { LinksFunction, MetaFunction } from '@remix-run/node';
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import styles from './globals.css?url';
import { cn } from './lib/utils';
import { serverOnly$ } from 'vite-env-only/macros';
import { createSessionMiddleware } from './lib/server/middleware/session';
import { sessionStorage } from './lib/server/session';

export const meta: MetaFunction = () => [{ title: 'DFoto' }];

export const links: LinksFunction = () => [
	{ rel: 'preconnect', href: 'https://rsms.me/' },
	{ rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
	{ rel: 'stylesheet', href: styles },
];

const session = createSessionMiddleware(sessionStorage);

export const middleware = serverOnly$([session]);

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
				<Toaster />
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}
