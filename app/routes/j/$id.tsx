import invariant from "tiny-invariant";
import { getDocument, JSONDocument } from "~/jsonDoc.server";
import { JsonDocProvider } from "~/hooks/useJsonDoc";
import { JsonProvider } from "~/hooks/useJson";
import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import { InfoPanel } from "~/components/InfoPanel";
import Resizable from "~/components/Resizable";
import { SideBar } from "~/components/SideBar";
import { JsonColumnViewProvider } from "~/hooks/useJsonColumnView";
import { JsonSchemaProvider } from "~/hooks/useJsonSchema";
import { JsonView } from "~/components/JsonView";
import { JsonTreeViewProvider } from "~/hooks/useJsonTree";
import { JsonSearchProvider } from "~/hooks/useJsonSearch";
import { ExtraLargeTitle } from "~/components/Primitives/ExtraLargeTitle";
import { PageNotFoundTitle } from "~/components/Primitives/PageNotFoundTitle";
import { SmallSubtitle } from "~/components/Primitives/SmallSubtitle";
import { Logo } from "~/components/Icons/Logo";
import { Outlet, useLoaderData as remixUseLoaderData } from "@remix-run/react";

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
      data: "Page not found" // 返回字符串而非空对象
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
function useParams(): Record<string, string> {
  // 在服务器端渲染时提供默认值
  if (typeof window === "undefined") {
    return { id: "criminal-cases" };
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

// 修复服务器端的useLoaderData函数，确保返回实际数据
function useLoaderData<T>(): T {
  try {
    // 尝试使用Remix原生的useLoaderData
    console.log("Attempting to use Remix's useLoaderData");
    const data = remixUseLoaderData();
    
    if (data) {
      console.log("Successfully retrieved data using Remix's useLoaderData");
      console.log("Data has doc:", data?.doc ? "Yes" : "No");
      console.log("Data has json:", data?.json ? "Yes" : "No");
      
      if (data?.json && Array.isArray(data.json)) {
        console.log(`JSON array contains ${data.json.length} items`);
      }
      
      return data as T;
    } else {
      console.log("Remix's useLoaderData returned empty data");
    }
  } catch (remixError) {
    console.error("Error using Remix's useLoaderData:", remixError);
  }
  
  // 如果Remix的useLoaderData失败，使用我们的自定义逻辑
  console.log("Fallback to custom useLoaderData implementation");
  
  // 检查环境
  const isServer = typeof window === "undefined";
  console.log(`Running in ${isServer ? "server" : "browser"} environment`);
  
  if (isServer) {
    console.log("Server-side rendering - creating default data");
    
    // 这里我们需要一个有效的默认值
    const defaultDoc = {
      id: "criminal-cases",
      type: "raw",
      contents: "[]",
      title: "Criminal Cases Data Viewer",
      readOnly: true,
    };
    
    return {
      doc: defaultDoc,
      json: []
    } as T;
  }
  
  // 客户端渲染时，尝试从window全局对象获取数据
  console.log("Client-side data retrieval");
  console.log("Window location:", window.location.pathname);
  
  try {
    // 检查window.__remixRouteData是否存在
    // @ts-ignore
    if (window.__remixRouteData) {
      // @ts-ignore
      const routeData = window.__remixRouteData;
      console.log("Found __remixRouteData:", Object.keys(routeData));
      
      // 遍历所有routes，寻找包含doc的数据
      // @ts-ignore
      for (const key in window.__remixRouteData) {
        // @ts-ignore
        const data = window.__remixRouteData[key];
        console.log(`Checking route "${key}":`, 
          data ? `Has data: ${Object.keys(data).join(", ")}` : "No data");
        
        if (data && data.doc) {
          console.log(`Found document data in route "${key}"`);
          return data as T;
        }
      }
    }
    
    // 如果没有找到路由数据，尝试从window对象获取
    // @ts-ignore
    if (window.__remixContext && window.__remixContext.routeData) {
      console.log("Trying __remixContext.routeData");
      // @ts-ignore
      const routeData = window.__remixContext.routeData;
      console.log("Found routeData keys:", Object.keys(routeData));
      
      // 尝试找到当前路由的数据
      const currentPath = window.location.pathname;
      
      // 打印所有路由数据
      Object.keys(routeData).forEach(key => {
        console.log(`Route "${key}":`, routeData[key] ? "Has data" : "No data");
      });
      
      // 尝试找到匹配的路由
      const routeId = Object.keys(routeData).find(key => 
        currentPath.includes(key.replace(/^routes\//, "").replace(/\$/g, ""))
      );
      
      if (routeId) {
        console.log(`Found matching route "${routeId}" for path "${currentPath}"`);
        return routeData[routeId] as T;
      }
    }
    
    console.error("======= DATA LOADING FAILURE =======");
    console.log("No route data found in any source");
    console.log("Current URL:", window.location.href);
    console.log("Creating fallback data to prevent crash");
    
    return {
      doc: {
        id: "fallback-criminal-cases",
        type: "raw", 
        contents: JSON.stringify([{
          "Title": "Data Loading Error", 
          "Error": "Failed to load data from server",
          "URL": window.location.href
        }]),
        title: "Criminal Cases - Error Loading Data",
        readOnly: true
      },
      json: [{
        "Title": "Data Loading Error", 
        "Error": "Failed to load data from server",
        "URL": window.location.href
      }]
    } as T;
  } catch (error) {
    console.error("Critical error in useLoaderData:", error);
    return {
      doc: {
        id: "error-fallback",
        type: "raw",
        contents: JSON.stringify([{"Error": `${error}`}]),
        title: "Error",
        readOnly: true
      },
      json: [{"Error": `${error}`}]
    } as T;
  }
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

export const loader = async ({ params }: { params: Record<string, string> }) => {
  console.log("Route $id loader called with params:", params);
  console.log("ID param value:", params.id);
  
  // 确保params.id存在
  if (!params.id) {
    console.error("Expected params.id but it was undefined");
    return {
      doc: {
        id: "criminal-cases",
        type: "raw",
        contents: "[]",
        title: "Criminal Cases Data Viewer",
        readOnly: true,
      },
      json: [],
      _serverData: true
    };
  }
  
  try {
    // 尝试使用原始ID
    console.log("Calling getDocument with id:", params.id);
    let doc = await getDocument(params.id);
    
    // 如果没有找到，尝试使用小写ID
    if (!doc && params.id !== params.id.toLowerCase()) {
      console.log("Document not found with original ID, trying lowercase");
      doc = await getDocument(params.id.toLowerCase());
    }
    
    // 如果还是没找到，默认使用criminal-cases ID
    if (!doc && params.id !== "criminal-cases") {
      console.log("Document not found with provided ID, using default 'criminal-cases'");
      doc = await getDocument("criminal-cases");
    }
    
    console.log("getDocument result:", doc ? "Document found" : "Document not found");
    
    if (!doc) {
      console.log("Document not found, returning empty document");
      return {
        doc: {
          id: params.id,
          type: "raw",
          contents: "[]",
          title: "Document Not Found",
          readOnly: true,
        },
        json: [],
        _serverData: true
      };
    }
    
    try {
      // 尝试解析JSON
      const parsedJson = JSON.parse(doc.contents);
      console.log("JSON parsed successfully");
      return {
        doc,
        json: parsedJson,
        _serverData: true
      };
    } catch (error) {
      // 如果解析失败，返回错误信息
      console.error("Error parsing JSON:", error);
      return {
        doc,
        json: [{
          "Error": "Failed to parse JSON",
          "Details": error instanceof Error ? error.message : String(error)
        }],
        _serverData: true
      };
    }
  } catch (error) {
    // 捕获所有其他错误
    console.error("Loader error:", error);
    return {
      doc: {
        id: params.id || "error",
        type: "raw",
        contents: JSON.stringify([{ "Error": "An unexpected error occurred" }]),
        title: "Error",
        readOnly: true,
      },
      json: [{ "Error": "An unexpected error occurred" }],
      _serverData: true
    };
  }
};

type LoaderData = {
  doc: JSONDocument;
  json: unknown;
};

export const meta = ({
  data,
}: {
  data: LoaderData | undefined;
}) => {
  let title = "Criminal Cases Data Viewer";

  if (data?.doc?.title) {
    title += ` - ${data.doc.title}`;
  }

  return {
    title,
    "og:title": title,
  };
};

export default function JsonDocumentRoute() {
  console.log("JsonDocumentRoute component rendering");
  
  try {
    // 获取数据
    const data = useLoaderData<{ doc: JSONDocument; json: any }>();
    
    // 添加更多数据检查
    console.log("Data retrieved in component:", 
      data ? `Has data: ${Object.keys(data).join(", ")}` : "No data");
    
    if (data?.doc) {
      console.log("Document ID:", data.doc.id);
      console.log("Document type:", data.doc.type);
      console.log("Document readOnly:", data.doc.readOnly);
      console.log("Document content length:", 
        data.doc.contents ? data.doc.contents.length : "not available");
    }
    
    // 如果有JSON数据，输出数组长度信息
    if (data?.json) {
      if (Array.isArray(data.json)) {
        console.log(`JSON is an array with ${data.json.length} items`);
      } else {
        console.log("JSON is not an array, it's a:", typeof data.json);
      }
    }
    
    // 确保我们总是有一个有效的doc对象，即使原始数据缺失
    const doc = data?.doc || {
      id: "fallback-criminal-cases",
      type: "raw" as const,
      contents: "[]",
      title: "Criminal Cases (Fallback)",
      readOnly: true
    };
    
    // 确保我们总是有有效的JSON数据
    const jsonData = data?.json || [];
    
    // 渲染组件 - 恢复原有的布局结构
    return (
      <JsonDocProvider doc={doc}>
        <JsonProvider initialJson={jsonData}>
          <JsonSchemaProvider>
            <JsonTreeViewProvider>
              <JsonColumnViewProvider>
                <JsonSearchProvider>
                  <div className="h-screen flex flex-col sm:overflow-hidden">
                    <Header />
                    <div className="bg-slate-50 flex-grow transition dark:bg-slate-900 overflow-y-auto">
                      <div className="main-container flex justify-items-stretch h-full">
                        {/* 左侧边栏 */}
                        <div className="sidebar-container min-w-[280px] w-[280px] h-full overflow-y-auto border-r border-gray-200 dark:border-gray-700">
                          <SideBar />
                        </div>
                        
                        {/* 中间内容区域 - 包括所有子路由内容 */}
                        <div className="middle-container flex-1 min-w-0 h-full overflow-y-auto">
                          <JsonView>
                            <Outlet />
                          </JsonView>
                        </div>
                        
                        {/* 右侧信息面板 */}
                        <div className="info-panel-container min-w-[300px] w-[300px] h-full overflow-y-auto border-l border-gray-200 dark:border-gray-700">
                          <InfoPanel />
                        </div>
                      </div>
                    </div>
                    <Footer />
                    
                    {/* 添加调试信息 - 确保调试面板不会挡住UI元素 */}
                    <div className="fixed bottom-0 right-0 bg-black text-white text-xs p-1 opacity-70 z-10 pointer-events-none">
                      <div>JSON items: {Array.isArray(jsonData) ? jsonData.length : "N/A"}</div>
                      <div>Doc ID: {doc.id}</div>
                    </div>
                  </div>
                </JsonSearchProvider>
              </JsonColumnViewProvider>
            </JsonTreeViewProvider>
          </JsonSchemaProvider>
        </JsonProvider>
      </JsonDocProvider>
    );
  } catch (renderError) {
    console.error("Error rendering JsonDocumentRoute:", renderError);
    
    // 发生错误时显示基本UI
    return (
      <div className="flex justify-center items-center h-screen flex-col space-y-4">
        <Logo className="h-12 w-12" />
        <PageNotFoundTitle>Rendering Error</PageNotFoundTitle>
        <SmallSubtitle>
          An error occurred while rendering the document viewer.
          <br />
          <span className="text-red-500">{String(renderError)}</span>
          <br />
          <a href="/j/criminal-cases" className="text-blue-500 underline">
            Try refreshing
          </a>
        </SmallSubtitle>
      </div>
    );
  }
}

export function CatchBoundary() {
  const error = useCatch();
  const params = useParams();

  // 确保error.data是字符串
  const errorMessage = typeof error.data === 'object' ? 
    JSON.stringify(error.data) : 
    (error.data || null);

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-[rgb(56,52,139)]">
      <div className="w-2/3">
        <div className="text-center text-lime-300">
          <div className="">
            <Logo width="100" />
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
                ? <>We couldn't find the page <b>{params.id}</b></>
                : "An unknown error occurred."
            )}
          </SmallSubtitle>
          <a
            href="/j/criminal-cases"
            className="mx-auto w-24 bg-lime-500 text-slate-900 text-lg font-bold px-5 py-1 rounded-sm uppercase whitespace-nowrap cursor-pointer opacity-90 hover:opacity-100 transition"
          >
            HOME
          </a>
        </div>
      </div>
    </div>
  );
}

