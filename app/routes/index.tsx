import { HomeCollaborateSection } from "~/components/Home/HomeCollaborateSection";
import { HomeEdgeCasesSection } from "~/components/Home/HomeEdgeCasesSection";
import { HomeFeatureGridSection } from "~/components/Home/HomeFeatureGridSection";
import { HomeHeader } from "~/components/Home/HomeHeader";
import { HomeHeroSection } from "~/components/Home/HomeHeroSection";
import { HomeInfoBoxSection } from "~/components/Home/HomeInfoBoxSection";
import { HomeSearchSection } from "~/components/Home/HomeSearchSection";
import { HomeFooter } from "~/components/Home/HomeFooter";
import {
  commitSession,
  getSession,
  ToastMessage,
} from "../services/toast.server";
import ToastPopover from "../components/UI/ToastPopover";
import { HomeTriggerDevBanner } from "~/components/Home/HomeTriggerDevBanner";

type LoaderData = { toastMessage?: ToastMessage };

// 创建一个简单的useLoaderData替代函数
function useLoaderData<T>(): T {
  // 从window对象中获取预加载的数据
  // 在服务器端渲染时，我们会返回一个空对象
  if (typeof window === "undefined") {
    return {} as T;
  }
  
  // 客户端可以从window.__remixContext中获取数据
  // @ts-ignore
  const routeData = window.__remixRouteData || {};
  // @ts-ignore
  return (routeData.root?.default || {}) as T;
}

export async function loader({ request }: { request: Request }) {
  const cookie = request.headers.get("cookie");
  const session = await getSession(cookie);
  const toastMessage = session.get("toastMessage") as ToastMessage;

  return new Response(JSON.stringify({ toastMessage }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function Index() {
  const { toastMessage } = useLoaderData<LoaderData>();

  return (
    <div className="overflow-x-hidden">
      {toastMessage && (
        <ToastPopover
          message={toastMessage.message}
          title={toastMessage.title}
          type={toastMessage.type}
          key={toastMessage.id}
        />
      )}

      <HomeHeader fixed={true} />
      <HomeHeroSection />
      <HomeInfoBoxSection />
      <HomeEdgeCasesSection />
      <HomeSearchSection />
      <HomeCollaborateSection />
      <HomeFeatureGridSection />
      <HomeFooter />
    </div>
  );
}
