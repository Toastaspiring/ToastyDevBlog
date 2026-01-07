
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkSupersub from 'remark-supersub';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

const markdown = `
# Test
Link: [Google](https://google.com)
Sub: H~2~O
Sup: X^2^
`;

const element = (
    <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkSupersub]}
        rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
    >
        {markdown}
    </ReactMarkdown>
);

console.log(ReactDOMServer.renderToStaticMarkup(element));
