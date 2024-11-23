import type { LinksFunction, MetaFunction } from '@remix-run/node';
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react';
import { ThemeProvider } from 'next-themes';
import { serverOnly$ } from 'vite-env-only/macros';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import styles from './globals.css?url';
import { createSessionMiddleware } from './lib/.server/middleware/session';
import { sessionStorage } from './lib/.server/session';
import { cn } from './lib/utils';

export const meta: MetaFunction = () => [{ title: 'DFoto' }];

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }];

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
		<html lang='en' suppressHydrationWarning className='scroll-smooth'>
			<head>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<Meta />
				<Links />
			</head>
			<body
				className={cn(
					'flex min-h-screen flex-col gap-4 bg-background font-sans antialiased',
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
