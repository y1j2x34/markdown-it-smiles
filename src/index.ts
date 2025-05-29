import { default as MarkdownIt } from 'markdown-it';
import { PluginOptions } from './PluginOptions';

export function MarkdownItSmiles(md: MarkdownIt, options: PluginOptions) {
    console.log(md, options);
}
