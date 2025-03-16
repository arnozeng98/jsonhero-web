import { useEffect } from "react";

// 创建Response重定向函数
function redirect(url: string, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Location", url);
  
  return new Response(null, {
    status: 302,
    headers,
    ...init,
  });
}

export function loader() {
  console.log("Criminal-cases route loader called");
  // 重定向到正确的路径
  return redirect("/j/criminal-cases");
}

export default function CriminalCasesRedirect() {
  useEffect(() => {
    // 客户端重定向备份
    window.location.href = "/j/criminal-cases";
  }, []);
  
  return (
    <div className="flex items-center justify-center w-screen h-screen bg-[rgb(56,52,139)]">
      <div className="text-white text-xl">
        Redirecting to Criminal Cases Viewer...
      </div>
    </div>
  );
} 