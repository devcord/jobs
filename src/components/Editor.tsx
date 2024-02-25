import { useRef, useState } from "react";
import { markdownToHtml, htmlToMarkdown } from '@/utils/parser';

import "react-quill/dist/quill.snow.css";

import dynamic from 'next/dynamic'

const DynamicQuill = dynamic(() => import('react-quill'), { ssr: false })

export interface EditorContentChanged {
  html: string;
  markdown: string;
}

export interface EditorProps {
  value?: string;
  onChange?: (changes: EditorContentChanged) => void;
}

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike", "blockquote", "link"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],
  ["clean"]
];

export default function Editor(props: EditorProps) {
  const [value, setValue] = useState<string>(markdownToHtml(props.value || ""));
  const reactQuillRef = useRef<typeof DynamicQuill>(null);

  const onChange = (content: string) => {
    setValue(content);

    if (props.onChange) {
      props.onChange({
        html: content,
        markdown: htmlToMarkdown(content)
      });
    }
  };

  return (
    <DynamicQuill
      // @ts-ignore - quill-react types are not up to date
      ref={reactQuillRef}
      theme="snow"
      placeholder="Start writing..."
      modules={{
        toolbar: {
          container: TOOLBAR_OPTIONS
        },
      }}
      value={value}
      onChange={onChange}
    />
  );
}
