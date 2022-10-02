import { json as jsonLang } from "@codemirror/lang-json";
import {
  EditorView,
  TransactionSpec,
  useCodeMirror,
  ViewUpdate,
} from "@uiw/react-codemirror";
import { useRef, useEffect } from "react";
import { useJsonDoc } from "~/hooks/useJsonDoc";
import { getEditorSetup } from "~/utilities/codeMirrorSetup";
import { darkTheme, lightTheme } from "~/utilities/codeMirrorTheme";
import { useTheme } from "./ThemeProvider";

export type CodeEditorProps = {
  content: string;
  language?: "json";
  readOnly?: boolean;
  onChange?: (value: string) => void;
  onUpdate?: (update: ViewUpdate) => void;
  selection?: { start: number; end: number };
};

const languages = {
  json: jsonLang,
};

type CodeEditorDefaultProps = Required<
  Omit<CodeEditorProps, "content" | "onChange" | "onUpdate">
>;

const defaultProps: CodeEditorDefaultProps = {
  language: "json",
  readOnly: true,
  selection: { start: 0, end: 0 },
};

export function CodeEditor(opts: CodeEditorProps) {
  const { content, language, readOnly, onChange, onUpdate, selection } = {
    ...defaultProps,
    ...opts,
  };

  const [theme] = useTheme();

  const extensions = getEditorSetup();

  const languageExtension = languages[language];

  extensions.push(languageExtension());

  const editor = useRef(null);
  const { setContainer, view, state } = useCodeMirror({
    container: editor.current,
    extensions,
    editable: !readOnly,
    contentEditable: !readOnly,
    value: content,
    autoFocus: false,
    theme: theme === "light" ? lightTheme() : darkTheme(),
    indentWithTab: false,
    basicSetup: false,
    onChange,
    onUpdate,
  });

  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current);
    }
  }, [editor.current]);

  const setSelectionRef = useRef(false);

  useEffect(() => {
    if (setSelectionRef.current) {
      return;
    }

    if (view) {
      setSelectionRef.current = true;

      const lineNumber = state?.doc.lineAt(selection?.start ?? 0).number;

      const transactionSpec: TransactionSpec = {
        selection: { anchor: selection.start, head: selection.end },
        effects: EditorView.scrollIntoView(selection.start, {
          y: "start",
          yMargin: 100,
        }),
      };

      view.dispatch(transactionSpec);
    }
  }, [selection, view, setSelectionRef.current]);

  const { minimal } = useJsonDoc();

  return (
    <div>
      <div
        className={`${
          minimal ? "h-jsonViewerHeightMinimal" : "h-jsonViewerHeight"
        } overflow-y-auto no-scrollbar`}
        ref={editor}
      />
    </div>
  );
}
