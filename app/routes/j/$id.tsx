import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "remix";
import invariant from "tiny-invariant";
import { deleteDocument, getDocument, JSONDocument } from "~/jsonDoc.server";
import { JsonDocProvider } from "~/hooks/useJsonDoc";
import { useEffect } from "react";
import { JsonProvider } from "~/hooks/useJson";
import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import { InfoPanel } from "~/components/InfoPanel";
import Resizable from "~/components/Resizable";
import { SideBar } from "~/components/SideBar";
import { JsonColumnViewProvider } from "~/hooks/useJsonColumnView";
import { JsonSchemaProvider } from "~/hooks/useJsonSchema";
import { JsonView } from "~/components/JsonView";
import safeFetch from "~/utilities/safeFetch";
import { JsonTreeViewProvider } from "~/hooks/useJsonTree";
import { JsonSearchProvider } from "~/hooks/useJsonSearch";
import { LargeTitle } from "~/components/Primitives/LargeTitle";
import { ExtraLargeTitle } from "~/components/Primitives/ExtraLargeTitle";
import { Body } from "~/components/Primitives/Body";
import { PageNotFoundTitle } from "~/components/Primitives/PageNotFoundTitle";
import { SmallSubtitle } from "~/components/Primitives/SmallSubtitle";
import { Logo } from "~/components/Icons/Logo";
import {
  commitSession,
  getSession,
  setErrorMessage,
  setSuccessMessage,
} from "~/services/toast.server";
import { getRandomUserAgent } from '~/utilities/getRandomUserAgent'
import { Outlet } from "@remix-run/react";

// 自定义的redirect函数
function redirect(url: string, init: any = {}): Response {
  let responseInit = init;
  responseInit.headers = new Headers(responseInit.headers);
  responseInit.headers.set("Location", url);
  
  return new Response(null, {
    status: 302,
    ...responseInit,
  });
}

// 自定义的useCatch函数
function useCatch() {
  // 在服务器端渲染时提供默认值
  if (typeof window === "undefined") {
    return {
      status: 404,
      statusText: "Not Found",
      data: "页面未找到" // 返回字符串而非空对象
    };
  }
  
  // @ts-ignore
  const data = window.__remixContext?.catchBoundaryRouteData || {};
  return {
    status: 404,
    statusText: "Not Found",
    data
  };
}

// 自定义的useParams函数
function useParams() {
  // 在服务器端渲染时提供默认值
  if (typeof window === "undefined") {
    return {};
  }
  
  // @ts-ignore
  const matches = window.__remixRouteIds || [];
  // @ts-ignore
  const routeData = window.__remixRouteData || {};
  
  // 假设当前路由ID是最后一个
  const currentRouteId = matches[matches.length - 1] || "";
  
  // 从路由ID提取参数
  // 例如: routes/j/$id -> { id: 'actual-id-value' }
  const params: Record<string, string> = {};
  if (currentRouteId.includes('$')) {
    const parts = currentRouteId.split('/');
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].startsWith('$')) {
        const paramName = parts[i].substring(1);
        params[paramName] = window.location.pathname.split('/')[i + 1] || '';
      }
    }
  }
  
  return params;
}

// 自定义的useLoaderData函数
function useLoaderData<T>(): T {
  // 从window对象中获取预加载的数据
  if (typeof window === "undefined") {
    return {} as T;
  }
  
  // @ts-ignore
  const routeData = window.__remixRouteData || {};
  // 获取当前路由的数据
  // @ts-ignore
  const matches = window.__remixRouteIds || [];
  const currentRouteId = matches[matches.length - 1] || "";
  
  // @ts-ignore
  return (routeData[currentRouteId] || {}) as T;
}

// 自定义的useLocation函数
function useLocation() {
  // 在服务器端渲染时提供默认值
  if (typeof window === "undefined") {
    return {
      pathname: "",
      search: "",
      hash: "",
      state: null
    };
  }
  
  // 在客户端渲染时正常使用window对象
  return {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    state: history.state
  };
}

export const loader: LoaderFunction = async ({ params, request }) => {
  invariant(params.id, "expected params.id");

  const doc = await getDocument(params.id);

  if (!doc) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  const path = getPathFromRequest(request);
  const minimal = getMinimalFromRequest(request);

  if (doc.type == "url") {
    console.log(`Fetching ${doc.url}...`);

    const jsonResponse = await safeFetch(doc.url, {
      headers: {
        "User-Agent": getRandomUserAgent(),
      },
    });

    if (!jsonResponse.ok) {
      const jsonResponseText = await jsonResponse.text();
      const error = `Failed to fetch ${doc.url}. HTTP status: ${jsonResponse.status} (${jsonResponseText}})`;
      console.error(error);

      throw new Response(error, {
        status: jsonResponse.status,
      });
    }

    const json = await jsonResponse.json();

    return {
      doc,
      json,
      path,
      minimal,
    };
  } else {
    return {
      doc,
      json: JSON.parse(doc.contents),
      path,
      minimal,
    };
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  // Return if the request is not a DELETE
  if (request.method !== "DELETE") {
    return;
  }

  invariant(params.id, "expected params.id");

  const toastCookie = await getSession(request.headers.get("cookie"));

  const document = await getDocument(params.id);

  if (!document) {
    setErrorMessage(toastCookie, "Document not found", "Error");

    return redirect(`/`);
  }

  if (document.readOnly) {
    setErrorMessage(toastCookie, "Document is read-only", "Error");

    return redirect(`/j/${params.id}`);
  }

  await deleteDocument(params.id);

  setSuccessMessage(toastCookie, "Document deleted successfully", "Success");

  return redirect("/", {
    headers: { "Set-Cookie": await commitSession(toastCookie) },
  });
};

// 获取路径参数
function getPathFromRequest(request: Request): string | undefined {
  const url = new URL(request.url);
  return url.searchParams.get("path") || undefined;
}

// 获取minimal参数
function getMinimalFromRequest(request: Request): boolean {
  const url = new URL(request.url);
  return url.searchParams.get("minimal") === "true";
}

type LoaderData = {
  doc: JSONDocument;
  json: unknown;
  path?: string;
  minimal?: boolean;
};

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => {
  let title = "JSON Hero";

  if (data?.doc?.title) {
    title += ` - ${data.doc.title}`;
  }

  return {
    title,
    "og:title": title,
    robots: "noindex,nofollow",
  };
};

export default function JsonDocumentRoute() {
  const loaderData = useLoaderData<LoaderData>();

  // Redirect back to `/j/${slug}` if the path is set, that way refreshing the page doesn't go to the path in the url.
  const location = useLocation();

  useEffect(() => {
    if (loaderData.path) {
      window.history.replaceState({}, "", location.pathname);
    }
  }, [loaderData.path]);

  return (
    <JsonDocProvider
      doc={loaderData.doc}
      path={loaderData.path}
      key={loaderData.doc.id}
      minimal={loaderData.minimal}
    >
      <JsonProvider initialJson={loaderData.json}>
        <JsonSchemaProvider>
          <JsonColumnViewProvider>
            <JsonSearchProvider>
              <JsonTreeViewProvider overscan={25}>
                <div>
                  <div className="block md:hidden fixed bg-black/80 h-screen w-screen z-50 text-white">
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <LargeTitle>JSON Hero only works on desktop</LargeTitle>
                      <LargeTitle>👇</LargeTitle>
                      <Body>(For now!)</Body>
                      <a
                        href="/"
                        className="mt-8 text-white bg-lime-500 rounded-sm px-4 py-2"
                      >
                        Back to Home
                      </a>
                    </div>
                  </div>
                  <div className="h-screen flex flex-col sm:overflow-hidden">
                    {!loaderData.minimal && <Header />}
                    <div className="bg-slate-50 flex-grow transition dark:bg-slate-900 overflow-y-auto">
                      <div className="main-container flex justify-items-stretch h-full">
                        <SideBar />
                        <JsonView>
                          <Outlet />
                        </JsonView>

                        <Resizable
                          isHorizontal={true}
                          initialSize={500}
                          minimumSize={280}
                          maximumSize={900}
                        >
                          <div className="info-panel flex-grow h-full">
                            <InfoPanel />
                          </div>
                        </Resizable>
                      </div>
                    </div>

                    <Footer></Footer>
                  </div>
                </div>
              </JsonTreeViewProvider>
            </JsonSearchProvider>
          </JsonColumnViewProvider>
        </JsonSchemaProvider>
      </JsonProvider>
    </JsonDocProvider>
  );
}

export function CatchBoundary() {
  const error = useCatch();
  const params = useParams();
  console.log("error", error)

  // 确保error.data是字符串
  const errorMessage = typeof error.data === 'object' ? 
    JSON.stringify(error.data) : 
    (error.data || null);

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-[rgb(56,52,139)]">
      <div className="w-2/3">
        <div className="text-center text-lime-300">
          <div className="">
            <Logo />
          </div>
          <PageNotFoundTitle className="text-center leading-tight">
            {error.status}
          </PageNotFoundTitle>
        </div>
        <div className="text-center leading-snug text-white">
          <ExtraLargeTitle className="text-slate-200 mb-8">
            <b>Sorry</b>! Something went wrong...
          </ExtraLargeTitle>
          <SmallSubtitle className="text-slate-200 mb-8">
            {errorMessage || (
              error.status === 404
                ? <>We couldn't find the page <b>https://jsonhero.io/j/{params.id}</b></>
                : "Unknown error occurred."
            )}
          </SmallSubtitle>
          <a
            href="/"
            className="mx-auto w-24 bg-lime-500 text-slate-900 text-lg font-bold px-5 py-1 rounded-sm uppercase whitespace-nowrap cursor-pointer opacity-90 hover:opacity-100 transition"
          >
            HOME
          </a>
        </div>
      </div>
    </div>
  );
}
