import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { LinksFunction } from "@remix-run/node";
import styles from "./tailwind.css?url";
import { TooltipProvider } from "./components/ui/tooltip";
import { cn } from "./lib/utils";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export function Providers({ children }: { children?: React.ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        className={cn(
          "flex min-h-screen flex-col bg-background font-sans antialiased"
        )}
      >
        <Providers>{children}</Providers>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
