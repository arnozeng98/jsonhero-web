import { useJsonDoc } from "~/hooks/useJsonDoc";

export function DocumentTitle() {
  const { doc } = useJsonDoc();

  return (
    <div
      className="flex justify-center items-center w-full"
      title={doc.title}
    >
      <span
        className="min-w-[15vw] border-none text-ellipsis text-slate-300 px-2 py-1 rounded-sm bg-transparent transition dark:bg-transparent dark:text-slate-200"
      >
        {doc.title}
      </span>
    </div>
  );
}
