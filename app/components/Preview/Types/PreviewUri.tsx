import { JSONStringType } from "@jsonhero/json-infer-types/lib/@types";
import { useEffect, useState } from "react";
import { Body } from "~/components/Primitives/Body";
import { useLoadWhenOnline } from "~/hooks/useLoadWhenOnline";
import { PreviewBox } from "../PreviewBox";
import { PreviewResult } from "./preview.types";
import { PreviewUriElement } from "./PreviewUriElement";

// 创建一个简单的fetcher对象
function useFetcher<T>() {
  const [state, setState] = useState<{
    type: "idle" | "loading" | "submitting" | "done";
    data: T | null;
  }>({
    type: "idle",
    data: null
  });

  return {
    type: state.type,
    data: state.data,
    load: (url: string) => {
      setState({ type: "loading", data: null });
      
      // 使用普通fetch替代
      if (typeof window !== "undefined" && typeof fetch === "function") {
        fetch(url)
          .then(response => response.json())
          .then(data => {
            setState({ type: "done", data });
          })
          .catch(err => {
            console.error("Error loading data:", err);
            setState({ 
              type: "done", 
              data: { error: "Failed to load preview" } as any 
            });
          });
      }
    }
  };
}

export type PreviewUriProps = {
  value: string;
  type: JSONStringType;
};

export function PreviewUri(props: PreviewUriProps) {
  const previewFetcher = useFetcher<PreviewResult>();
  const encodedUri = encodeURIComponent(props.value);
  const load = () => previewFetcher.load(`/actions/getPreview/${encodedUri}`);

  useLoadWhenOnline(load, [encodedUri]);

  return (
    <div>
      {previewFetcher.type === "done" && previewFetcher.data ? (
        <>
          {typeof previewFetcher.data == "string" ? (
            <PreviewBox>
              <Body>
                <span
                  dangerouslySetInnerHTML={{ __html: previewFetcher.data }}
                ></span>
              </Body>
            </PreviewBox>
          ) : "error" in previewFetcher.data ? (
            <PreviewBox>
              <Body>{previewFetcher.data.error}</Body>
            </PreviewBox>
          ) : (
            <PreviewUriElement info={previewFetcher.data as any} />
          )}
        </>
      ) : (
        <PreviewBox>
          <Body className="h-96 animate-pulse bg-slate-300 dark:text-slate-300 dark:bg-slate-500 flex justify-center items-center">
            Loading…
          </Body>
        </PreviewBox>
      )}
    </div>
  );
}
