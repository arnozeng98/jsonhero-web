import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import type { 
  LoaderFunction, 
  MetaFunction 
} from "remix";
import clsx from "clsx";
import {
  NonFlashOfWrongThemeEls,
  Theme,
  ThemeProvider,
  useTheme,
} from "~/components/ThemeProvider";

import openGraphImage from "~/assets/images/opengraph.png";

export const meta: MetaFunction = () => {
  const description =
    "Criminal Cases Data Viewer provides a clean and beautiful interface for browsing and understanding criminal case JSON data.";
  return {
    title: "Criminal Cases Data Viewer",
    viewport: "width=device-width,initial-scale=1",
    description,
  };
};

import styles from "./tailwind.css";
import { getThemeSession } from "./theme.server";
import { getStarCount } from "./services/github.server";
import { StarCountProvider } from "./components/StarCountProvider";
import { PreferencesProvider } from "~/components/PreferencesProvider";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export type LoaderData = {
  theme?: Theme;
  starCount?: number;
  themeOverride?: Theme;
};

export const loader: LoaderFunction = async ({ request }: { request: Request }) => {
  const themeSession = await getThemeSession(request);
  const starCount = await getStarCount();
  const themeOverride = getThemeFromRequest(request);

  const data: LoaderData = {
    theme: themeSession.getTheme(),
    starCount,
    themeOverride,
  };

  return data;
};

function getThemeFromRequest(request: Request): Theme | undefined {
  const url = new URL(request.url);
  const theme = url.searchParams.get("theme");
  if (theme) {
    return theme as Theme;
  }
  return undefined;
}

function App() {
  const [theme] = useTheme();

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <Meta />
        <meta charSet="utf-8" />
        <Links />
        <NonFlashOfWrongThemeEls ssrTheme={Boolean(theme)} />
      </head>
      <body className="overscroll-none">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  const { theme, starCount, themeOverride } = useLoaderData<LoaderData>();

  const location = useLocation();

  return (
    <ThemeProvider
      specifiedTheme={theme}
      themeOverride={themeOverride}
    >
      <PreferencesProvider>
        <StarCountProvider starCount={starCount}>
          <App />
        </StarCountProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}
