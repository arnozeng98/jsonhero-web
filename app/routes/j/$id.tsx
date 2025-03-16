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

// 自定义的useLoaderData函数
function useLoaderData<T>(): T {
  // 从window对象中获取预加载的数据
  if (typeof window === "undefined") {
    // 在服务器端渲染时，返回包含默认文档和解析后JSON的对象
    const sampleJson = [
      {
        "Title": "R. v. Primeau",
        "Collection": "Supreme Court Judgments",
        "Date": "1995-04-13",
        "Neutral Citation": null,
        "Case Number": "23613",
        "Judges": "Lamer, Antonio; La Forest, Gérard V.; L'Heureux-Dubé, Claire; Sopinka, John; Gonthier, Charles Doherty; Cory, Peter deCarteret; McLachlin, Beverley; Iacobucci, Frank; Major, John C.",
        "On Appeal From": "Saskatchewan",
        "Subjects": "Constitutional law\nCourts\nCriminal law",
        "Statutes and Regulations Cited": [
          "Criminal Code , R.S.C., 1985, c. C‑46 , s. 784(1) ."
        ],
        "Facts": "II.The appellant, Dorne James Primeau, was jointly charged along with Rory Michael Cornish with the first degree murder of Calvin Aubichon. On a separate information, Jerry Allan Lefort was charged with the same murder."
      },
      {
        "Title": "R. v. Feeney",
        "Collection": "Supreme Court Judgments",
        "Date": "1997-05-22",
        "Neutral Citation": null,
        "Case Number": "24756",
        "Facts": "Sample facts for this case"
      }
    ];
    
    return {
      doc: {
        id: "criminal-cases",
        type: "raw",
        contents: JSON.stringify(sampleJson, null, 2),
        title: "Criminal Cases Data Viewer",
        readOnly: true,
      },
      json: sampleJson
    } as T;
  }
  
  // 客户端简化逻辑 - 直接输出一些调试信息
  console.log("Client-side useLoaderData called");
  console.log("Window location:", window.location.pathname);
  
  try {
    // 尝试直接从window._remixRouteData获取数据
    // @ts-ignore
    if (window.__remixRouteData) {
      // @ts-ignore
      const data = window.__remixRouteData;
      console.log("Found remixRouteData:", Object.keys(data));
      
      // 返回第一个找到的数据
      // @ts-ignore
      for (const key in window.__remixRouteData) {
        // @ts-ignore
        const routeData = window.__remixRouteData[key];
        if (routeData && routeData.doc) {
          console.log("Found route data with doc for key:", key);
          return routeData as T;
        }
      }
    }
    
    // 使用默认数据
    console.log("No route data found, using default data");
    const sampleJson = [
      {
        "Title": "R. v. Primeau (Client)",
        "Collection": "Supreme Court Judgments",
        "Date": "1995-04-13",
        "Facts": "Client-side fallback data"
      }
    ];
    
    return {
      doc: {
        id: "criminal-cases",
        type: "raw",
        contents: JSON.stringify(sampleJson, null, 2),
        title: "Criminal Cases Data Viewer",
        readOnly: true,
      },
      json: sampleJson
    } as T;
  } catch (e) {
    console.error("Error in useLoaderData:", e);
    // 返回空对象而不是undefined
    return {} as T;
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
  const loaderData = useLoaderData<LoaderData>();
  
  // 添加客户端调试逻辑
  if (typeof window !== "undefined") {
    console.log("Running JsonDocumentRoute in browser");
    console.log("loaderData available:", loaderData ? "yes" : "no");
    
    // 尝试从全局变量中获取数据
    if (window.__DEBUG_DATA) {
      console.log("Debug data:", window.__DEBUG_DATA);
      
      // 将调试信息添加到页面中
      setTimeout(() => {
        try {
          const debugDiv = document.createElement("div");
          debugDiv.style.position = "fixed";
          debugDiv.style.bottom = "10px";
          debugDiv.style.right = "10px";
          debugDiv.style.padding = "10px";
          debugDiv.style.background = "rgba(0,0,0,0.7)";
          debugDiv.style.color = "white";
          debugDiv.style.zIndex = "9999";
          debugDiv.style.maxWidth = "500px";
          debugDiv.style.maxHeight = "300px";
          debugDiv.style.overflow = "auto";
          debugDiv.style.fontSize = "12px";
          debugDiv.style.fontFamily = "monospace";
          
          debugDiv.innerHTML = `
            <div>Page loaded at: ${new Date().toISOString()}</div>
            <div>Data available: ${loaderData ? "yes" : "no"}</div>
            <div>URL: ${window.location.href}</div>
            <div>Doc ID: ${loaderData?.doc?.id || "missing"}</div>
          `;
          
          document.body.appendChild(debugDiv);
        } catch (e) {
          console.error("Failed to add debug div:", e);
        }
      }, 1000);
    }
  }
  
  // 即使loaderData为空，也创建一个有效的数据结构
  const safeData = loaderData || {
    doc: {
      id: "criminal-cases",
      type: "raw",
      contents: JSON.stringify([
        {
          "Title": "R. v. Primeau",
          "Collection": "Supreme Court Judgments",
          "Date": "1995-04-13",
          "Neutral Citation": null,
          "Case Number": "23613",
          "Facts": "Example case data"
        }
      ]),
      title: "Criminal Cases Data Viewer",
      readOnly: true,
    },
    json: [
      {
        "Title": "R. v. Primeau",
        "Collection": "Supreme Court Judgments",
        "Date": "1995-04-13",
        "Facts": "Example case data"
      }
    ]
  };

  console.log("Client rendering with data:", 
    safeData?.doc?.id, 
    safeData?.json ? "JSON data present" : "No JSON data"
  );

  return (
    <JsonDocProvider
      doc={safeData.doc}
      key={safeData.doc.id}
    >
      <JsonProvider initialJson={safeData.json}>
        <JsonSchemaProvider>
          <JsonColumnViewProvider>
            <JsonSearchProvider>
              <JsonTreeViewProvider overscan={25}>
                <div>
                  <div className="h-screen flex flex-col sm:overflow-hidden">
                    <Header />
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

