import { useJsonDoc } from "~/hooks/useJsonDoc";
import { ArrowKeysIcon } from "./Icons/ArrowKeysIcon";
import { CopyShortcutIcon } from "./Icons/CopyShortcutIcon";
import { EscapeKeyIcon } from "./Icons/EscapeKeyIcon";
import { SquareBracketsIcon } from "./Icons/SquareBracketsIcon";
import { Body } from "./Primitives/Body";
import { ThemeModeToggler } from "./ThemeModeToggle";
import { IndentPreference } from "~/components/IndentPreference";

export function Footer() {
  return (
    <footer className="flex items-center justify-between w-screen h-[32px] flex-shrink-0 bg-slate-200 dark:bg-slate-800 border-t-[1px] border-slate-400 transition dark:border-slate-600">
      <ol className="flex pl-3">
        <li className="flex items-center">
          <ArrowKeysIcon className="transition text-slate-300 dark:text-slate-500" />
          <Body className="pl-2 pr-4 text-slate-800 transition dark:text-white">
            Navigate
          </Body>
        </li>
        <li className="flex items-center">
          <SquareBracketsIcon className="transition text-slate-300 dark:text-slate-500" />
          <Body className="pl-2 pr-4 text-slate-800 transition dark:text-white">
            History
          </Body>
        </li>
        <li className="flex items-center">
          <EscapeKeyIcon className="transition text-slate-300 dark:text-slate-500" />
          <Body className="pl-2 pr-4 text-slate-800 transition dark:text-white whitespace-nowrap">
            Reset path
          </Body>
        </li>
        <li className="flex items-center">
          <CopyShortcutIcon className="transition text-slate-300 dark:text-slate-500" />
          <Body className="flex pl-2 pr-4 text-slate-800 transition dark:text-white">
            Copy node
          </Body>
        </li>
      </ol>
      <ol className="flex gap-2 items-center h-full invisible md:visible">
        <li>
          <IndentPreference />
        </li>
        <li>
          <ThemeModeToggler />
        </li>
      </ol>
    </footer>
  );
}
