import { PencilAltIcon } from "@heroicons/react/outline";
import { useEffect, useRef, useState } from "react";
import { match } from "ts-pattern";
import { useJsonDoc } from "~/hooks/useJsonDoc";

// 创建一个简单的fetcher对象
function useFetcher<T = any>() {
  const [state, setState] = useState<{
    type: "idle" | "loading" | "submitting" | "done";
    data: T;
  }>({
    type: "idle",
    data: {} as T
  });

  return {
    type: state.type,
    data: state.data,
    submit: (formData: any, options: { action: string, method: string }) => {
      setState(prev => ({ ...prev, type: "submitting" }));
      
      if (typeof window !== "undefined" && typeof fetch === "function") {
        const form = new FormData();
        for (const key in formData) {
          form.append(key, formData[key]);
        }
        
        fetch(options.action, {
          method: options.method,
          body: form
        })
          .then(response => response.json())
          .then(data => {
            setState({ type: "done", data });
          })
          .catch(err => {
            console.error("Error submitting data:", err);
            setState({ 
              type: "done", 
              data: { error: "Failed to submit" } as any 
            });
          });
      }
    }
  };
}

export function DocumentTitle() {
  const { doc } = useJsonDoc();
  const [editedTitle, setEditedTitle] = useState(doc.title);
  const updateDoc = useFetcher();
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (updateDoc.type === "done" && updateDoc.data.title) {
      ref.current?.blur();
    }
  }, [updateDoc]);

  if (doc.readOnly) {
    return (
      <div
        className="flex justify-center items-center w-full"
        title={doc.title}
      >
        <span
          className={
            "min-w-[15vw] border-none text-ellipsis text-slate-300 px-2 pl-10 py-1 rounded-sm bg-transparent placeholder:text-slate-400 focus:bg-black/30 focus:outline-none focus:border-none hover:cursor-text transition dark:bg-transparent dark:text-slate-200 dark:placeholder:text-slate-400 dark:focus:bg-black dark:focus:bg-opacity-10"
          }
        >
          {doc.title}
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex justify-center items-center w-full relative"
      title={doc.title}
    >
      <span className="absolute left-2 z-10">
        <PencilAltIcon className="w-4 h-4 text-slate-400" />
      </span>
      <input
        ref={ref}
        className="min-w-[15vw] focus:w-full border-none text-ellipsis text-slate-300 px-2 pl-10 py-1 rounded-sm bg-transparent placeholder:text-slate-400 focus:bg-black/30 focus:outline-none focus:border-none hover:cursor-text transition dark:bg-transparent dark:text-slate-200 dark:placeholder:text-slate-400 dark:focus:bg-black dark:focus:bg-opacity-10"
        placeholder="No title"
        value={editedTitle}
        onChange={(e) => setEditedTitle(e.target.value)}
        onBlur={() => {
          if (editedTitle !== doc.title) {
            updateDoc.submit(
              { title: editedTitle },
              {
                action: `/actions/updateDoc/${doc.id}`,
                method: "post",
              }
            );
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (editedTitle !== doc.title) {
              updateDoc.submit(
                { title: editedTitle },
                {
                  action: `/actions/updateDoc/${doc.id}`,
                  method: "post",
                }
              );
            }
          }
        }}
      />
      {match(updateDoc)
        .with({ type: "submitting" }, () => (
          <span className="absolute right-4 text-xs text-sky-500 italic">
            Saving...
          </span>
        ))
        .otherwise(() => null)}
    </div>
  );
}
