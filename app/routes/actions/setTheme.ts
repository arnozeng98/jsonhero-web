import type { ActionFunction, LoaderFunction } from "remix";
import { getThemeSession } from "~/theme.server";
import { isTheme } from "~/components/ThemeProvider";
import { sendEvent } from "~/graphJSON.server";

// 创建自定义的redirect函数
function redirect(url: string, init: any = {}): Response {
  let responseInit = init;
  responseInit.headers = new Headers(responseInit.headers);
  responseInit.headers.set("Location", url);
  
  return new Response(null, {
    status: 302,
    ...responseInit,
  });
}

export const action: ActionFunction = async ({ request, context }) => {
  const themeSession = await getThemeSession(request);
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const theme = form.get("theme");

  if (!isTheme(theme)) {
    return new Response(
      JSON.stringify({
        success: false,
        message: `theme value of ${theme} is not a valid theme`,
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  themeSession.setTheme(theme);

  context.waitUntil(
    sendEvent({
      type: "set-theme",
      theme,
    })
  );

  return new Response(
    JSON.stringify({ success: true }),
    { 
      headers: { 
        "Content-Type": "application/json",
        "Set-Cookie": await themeSession.commit() 
      } 
    }
  );
};

export const loader: LoaderFunction = () => redirect("/", { status: 404 });
