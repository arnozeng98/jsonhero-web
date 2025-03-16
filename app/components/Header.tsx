import { DocumentTitle } from "./DocumentTitle";
import { Logo } from "./Icons/Logo";
import { useJsonDoc } from "~/hooks/useJsonDoc";

export function Header() {
  const { doc } = useJsonDoc();

  return (
    <header className="flex items-center justify-between w-screen h-[40px] bg-indigo-700 dark:bg-slate-800 border-b-[1px] border-slate-600">
      <div className="flex pl-2 gap-1 sm:gap-1.5 pt-0.5 h-8 justify-center items-center">
        <div className="w-20 sm:w-24">
          <Logo />
        </div>
        <p className="text-slate-300 text-sm font-sans">Criminal Cases Data</p>
      </div>
      <DocumentTitle />
      <div className="w-32"></div> {/* 保持布局平衡的空div */}
    </header>
  );
}
