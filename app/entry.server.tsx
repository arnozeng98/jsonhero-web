import { renderToString } from "react-dom/server";
import { RemixServer } from "@remix-run/react";

// 更完整的EntryContext接口定义
interface EntryContext {
  appState: any;
  manifest: any;
  matches: any[];
  routeData: Record<string, any>;
  routeModules: Record<string, any>;
}

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const markup = renderToString(
    <RemixServer context={remixContext as any} url={request.url} />
  );

  responseHeaders.set("Content-Type", "text/html");

  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: responseHeaders
  });
}
