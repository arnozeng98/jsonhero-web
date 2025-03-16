import { hydrate } from "react-dom";
import { RemixBrowser } from "@remix-run/react";

// 添加调试日志
console.log("Client entry point loading");

// 创建一个全局变量，以便于从React组件中访问
declare global {
  interface Window {
    __DEBUG_DATA?: any;
  }
}

// 尝试读取和保存路由数据
try {
  // @ts-ignore
  window.__DEBUG_DATA = {
    // @ts-ignore
    routeData: window.__remixRouteData || {},
    // @ts-ignore
    matches: window.__remixContext?.matches || [],
    location: window.location.toString(),
    timestamp: new Date().toISOString()
  };
  
  console.log("Debug data saved to window.__DEBUG_DATA");
} catch (e) {
  console.error("Failed to save debug data:", e);
}

// 继续正常的水合过程
hydrate(<RemixBrowser />, document);
