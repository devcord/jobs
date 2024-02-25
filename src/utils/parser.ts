import { remark } from 'remark';
import remarkHtml from 'remark-html';

import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";

export const htmlToMarkdown = (html: string) => {
  const file = remark()
    .use(rehypeParse, { emitParseErrors: true, duplicateAttribute: false })
    .use(rehypeRemark)
    .use(remarkStringify)
    .processSync(html);

  return String(file);
}

export const markdownToHtml = (markdown: string) => {
  const file = remark().use(remarkHtml).processSync(markdown);
  return String(file);
}

export default htmlToMarkdown;