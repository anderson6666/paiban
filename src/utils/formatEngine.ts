// 知乎排版引擎
// 输入：原始 Markdown / 纯文本
// 输出：{ html, markdown }
// 规则：标题识别 / Top500 关键词加粗 / 短句换行 / LaTeX 标记

import { SORTED_KEYWORDS, EXCLUDE_WORDS } from '@/data/keywords';

export type LatexType = 'color' | 'border' | 'underline' | 'box';

export interface FormatOptions {
  boldKeywords: boolean;       // 关键词加粗
  breakSentences: boolean;     // 短句换行
  formatHeadings: boolean;     // 标题识别
  latexColor: string;          // 变色色值
  latexBgColor: string;        // 边框底色
  latexBorderColor: string;    // 边框/框住色
}

export const DEFAULT_OPTIONS: FormatOptions = {
  boldKeywords: true,
  breakSentences: true,
  formatHeadings: true,
  latexColor: '#FF9600',
  latexBgColor: '#FFF3E0',
  latexBorderColor: '#FF9600',
};

// 中文标题序号正则：一、 二、 1. （一） 第一章
const CN_HEADING_RE = /^(#{1,6})\s+(.+)$/;
const CN_NUM_HEADING_RE = /^(第[一二三四五六七八九十百千]+[章篇节部分]|[一二三四五六七八九十]{1,3}[、.．]|（[一二三四五六七八九十]{1,3}）|\d{1,3}[、.．])\s*(.+)$/;

// 末尾标点
const END_PUNCT_RE = /[。！？；!?;]$/;

// 转义 HTML
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// 转义正则特殊字符
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 识别标题
 * - `#`~`######` → H1-H6
 * - 「第X章」「一、」「1.」「（一）」 → H2
 * - 短行（≤20字）+ 末尾无标点 + 独立成行 → H3
 */
export function detectHeading(line: string): { level: number; text: string; prefix?: string } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // markdown # 形式
  const m1 = trimmed.match(CN_HEADING_RE);
  if (m1) {
    return { level: m1[1].length, text: m1[2].trim() };
  }

  // 中文序号 / 阿拉伯数字序号
  const m2 = trimmed.match(CN_NUM_HEADING_RE);
  if (m2) {
    return { level: 2, text: trimmed, prefix: m2[1] };
  }

  return null;
}

/**
 * 判断一行是否为「短标题」（独立短行）
 * 规则：长度 ≤ 20、非空、末尾不是标点、不是列表项/引用/代码
 */
export function isShortHeading(line: string, prevLine: string, nextLine: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.length > 20) return false;
  // 排除特殊行
  if (/^[-*+]\s/.test(trimmed)) return false;     // 列表
  if (/^\d+\.\s/.test(trimmed)) return false;     // 有序列表
  if (/^>/.test(trimmed)) return false;           // 引用
  if (/^```/.test(trimmed)) return false;         // 代码块标记
  if (/^---+$/.test(trimmed)) return false;       // 分隔线
  if (/^\|.+\|$/.test(trimmed)) return false;     // 表格
  // 末尾不能是句末标点
  if (END_PUNCT_RE.test(trimmed)) return false;
  if (/[，,、：:；;]$/.test(trimmed)) return false;
  // 必须上下有空行（独立成段）
  if (prevLine.trim() !== '' && nextLine.trim() !== '') return false;
  // 必须包含至少一个汉字或字母
  if (!/[\u4e00-\u9fa5a-zA-Z]/.test(trimmed)) return false;
  return true;
}

/**
 * 短句换行：在 。！？； 后插入换行
 * 仅对正文段落生效，不破坏代码块/列表/引用/标题
 */
export function breakSentencesInParagraph(text: string): string {
  // 在标点后插入 \n，但避免连续换行
  return text
    .replace(/([。！？；!?;])\s*/g, '$1\n')
    .replace(/\n{2,}/g, '\n\n');
}

/**
 * 关键词加粗（HTML 模式）
 * 在已转义的 HTML 文本中加粗 Top500 关键词
 */
export function boldKeywordsHtml(html: string): string {
  let result = html;
  // 按长度倒序匹配，避免短词覆盖长词
  for (const kw of SORTED_KEYWORDS) {
    if (EXCLUDE_WORDS.has(kw)) continue;
    const re = new RegExp(`(?<![\\w<>])(${escapeRegExp(escapeHtml(kw))})(?![\\w<>])`, 'g');
    result = result.replace(re, `<strong>$1</strong>`);
  }
  // 合并相邻的 <strong> 标签
  result = result.replace(/<\/strong>(\s*)<strong>/g, '$1');
  return result;
}

/**
 * 关键词加粗（Markdown 模式）
 */
export function boldKeywordsMd(md: string): string {
  let result = md;
  for (const kw of SORTED_KEYWORDS) {
    if (EXCLUDE_WORDS.has(kw)) continue;
    const re = new RegExp(`(?<![\\w*\\[])(${escapeRegExp(kw)})(?![\\w*\\]])`, 'g');
    result = result.replace(re, `**$1**`);
  }
  // 合并相邻 **
  result = result.replace(/\*\*(\s*)\*\*/g, '$1');
  return result;
}

/**
 * 自动处理 LaTeX 标记：将 【type:内容】 或 【内容】 转换为对应 HTML
 * 支持类型：color / border / underline / box（默认 color）
 */
function processLatexMarkers(text: string, opts: FormatOptions): string {
  return text.replace(/【([^】]+)】/g, (_match, inner: string) => {
    // 解析 type:content 格式
    const colonIdx = inner.indexOf(':');
    let type: LatexType = 'color';
    let content: string;
    if (colonIdx > 0) {
      const prefix = inner.slice(0, colonIdx);
      const rest = inner.slice(colonIdx + 1);
      if (['color', 'border', 'underline', 'box'].includes(prefix)) {
        type = prefix as LatexType;
        content = rest;
      } else {
        content = inner;
      }
    } else {
      content = inner;
    }

    switch (type) {
      case 'color':
        return `<span style="color:${opts.latexColor}">${content}</span>`;
      case 'border':
        return `<span style="background:${opts.latexBgColor};border:1px solid ${opts.latexBorderColor};padding:2px 6px;border-radius:3px">${content}</span>`;
      case 'underline':
        return `<span style="text-decoration:underline;text-decoration-color:${opts.latexColor};text-decoration-thickness:2px">${content}</span>`;
      case 'box':
        return `<span style="border:2px solid ${opts.latexBorderColor};padding:2px 8px;border-radius:6px">${content}</span>`;
    }
  });
}

/**
 * 对选中文本应用 LaTeX 标记（HTML）
 */
export function applyLatexMarkHtml(html: string, type: LatexType, opts: FormatOptions): string {
  return html.replace(/【([^】]+)】/g, (_match, inner: string) => {
    switch (type) {
      case 'color':
        return `<span style="color:${opts.latexColor}">${inner}</span>`;
      case 'border':
        return `<span style="background:${opts.latexBgColor};border:1px solid ${opts.latexBorderColor};padding:2px 6px;border-radius:3px">${inner}</span>`;
      case 'underline':
        return `<span style="text-decoration:underline;text-decoration-color:${opts.latexColor};text-decoration-thickness:2px">${inner}</span>`;
      case 'box':
        return `<span style="border:2px solid ${opts.latexBorderColor};padding:2px 8px;border-radius:6px">${inner}</span>`;
    }
  });
}

/**
 * LaTeX 标记（Markdown）
 * 知乎 markdown 模式不支持自定义样式，输出 HTML 标签
 */
function applyLatexMarkMd(md: string, opts: FormatOptions): string {
  return processLatexMarkers(md, opts);
}

/**
 * 主格式化函数
 */
export function formatAll(input: string, opts: FormatOptions): { html: string; markdown: string } {
  const lines = input.replace(/\r\n/g, '\n').split('\n');
  const outHtml: string[] = [];
  const outMd: string[] = [];

  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBuffer: string[] = [];

  const flushCode = () => {
    if (codeBuffer.length === 0) return;
    const code = codeBuffer.join('\n');
    outHtml.push(`<pre><code>${escapeHtml(code)}</code></pre>`);
    outMd.push('```' + codeBlockLang + '\n' + code + '\n```');
    codeBuffer = [];
    codeBlockLang = '';
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prev = i > 0 ? lines[i - 1] : '';
    const next = i < lines.length - 1 ? lines[i + 1] : '';
    const trimmed = line.trim();

    // 代码块处理
    if (/^```/.test(trimmed)) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim();
      } else {
        inCodeBlock = false;
        flushCode();
      }
      continue;
    }
    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // 空行
    if (trimmed === '') {
      outHtml.push('');
      outMd.push('');
      continue;
    }

    // 分隔线
    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      outHtml.push('<hr/>');
      outMd.push('---');
      continue;
    }

    // 引用块
    if (/^>\s?/.test(trimmed)) {
      const content = trimmed.replace(/^>\s?/, '');
      const processed = processInline(content, opts);
      outHtml.push(`<blockquote>${processed.html}</blockquote>`);
      outMd.push(`> ${processed.md}`);
      continue;
    }

    // 无序列表
    if (/^[-*+]\s+/.test(trimmed)) {
      const content = trimmed.replace(/^[-*+]\s+/, '');
      const processed = processInline(content, opts);
      outHtml.push(`<ul><li>${processed.html}</li></ul>`);
      outMd.push(`- ${processed.md}`);
      continue;
    }

    // 有序列表
    if (/^\d+\.\s+/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s+(.+)$/);
      if (match) {
        const num = match[1];
        const content = match[2];
        const processed = processInline(content, opts);
        outHtml.push(`<ol><li>${processed.html}</li></ol>`);
        outMd.push(`${num}. ${processed.md}`);
        continue;
      }
    }

    // 标题识别
    if (opts.formatHeadings) {
      const heading = detectHeading(line);
      if (heading) {
        const tag = `h${Math.min(heading.level, 6)}`;
        outHtml.push(`<${tag}>${escapeHtml(heading.text)}</${tag}>`);
        outMd.push(`${'#'.repeat(Math.min(heading.level, 6))} ${heading.text}`);
        continue;
      }

      // 短行标题
      if (isShortHeading(line, prev, next)) {
        outHtml.push(`<h3>${escapeHtml(trimmed)}</h3>`);
        outMd.push(`### ${trimmed}`);
        continue;
      }
    }

    // 普通段落
    const processed = processInline(line, opts);
    outHtml.push(`<p>${processed.html}</p>`);
    outMd.push(processed.md);
  }

  // 收尾代码块
  if (inCodeBlock) flushCode();

  // 合并连续的列表项
  const html = mergeLists(outHtml).join('\n');
  const markdown = outMd.join('\n');

  return { html, markdown };
}

/**
 * 处理行内元素：加粗、换行、LaTeX
 */
function processInline(text: string, opts: FormatOptions): { html: string; md: string } {
  let work = text;

  // 短句换行（md 模式直接换行，html 模式用 <br>）
  if (opts.breakSentences) {
    work = work.replace(/([。！？；!?;])\s*/g, '$1\n');
  }

  // 行内代码保护：将 `code` 替换为占位符
  const codePlaceholders: string[] = [];
  work = work.replace(/`([^`]+)`/g, (_, code) => {
    codePlaceholders.push(code);
    return `\u0000CODE${codePlaceholders.length - 1}\u0000`;
  });

  // 链接保护：[text](url)
  const linkPlaceholders: string[] = [];
  work = work.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, txt, url) => {
    linkPlaceholders.push({ txt, url } as any);
    return `\u0000LINK${linkPlaceholders.length - 1}\u0000`;
  });

  // HTML 输出
  let html = escapeHtml(work);
  let md = work;

  // LaTeX 标记自动处理：将 【type:内容】 或 【内容】 转换为样式 HTML
  html = processLatexMarkers(html, opts);
  md = applyLatexMarkMd(md, opts);

  // 关键词加粗
  if (opts.boldKeywords) {
    html = boldKeywordsHtml(html);
    md = boldKeywordsMd(md);
  }

  // 恢复链接占位符
  html = html.replace(/\u0000LINK(\d+)\u0000/g, (_, i) => {
    const link = linkPlaceholders[+i] as any;
    return `<a href="${escapeHtml(link.url)}">${escapeHtml(link.txt)}</a>`;
  });
  md = md.replace(/\u0000LINK(\d+)\u0000/g, (_, i) => {
    const link = linkPlaceholders[+i] as any;
    return `[${link.txt}](${link.url})`;
  });

  // 恢复行内代码占位符
  html = html.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => {
    return `<code>${escapeHtml(codePlaceholders[+i])}</code>`;
  });
  md = md.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => {
    return `\`${codePlaceholders[+i]}\``;
  });

  // HTML 中将换行转为 <br>
  html = html.replace(/\n/g, '<br/>');

  return { html, md };
}

/**
 * 合并相邻的同类列表
 */
function mergeLists(lines: string[]): string[] {
  const result: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const cur = lines[i];
    if (cur.startsWith('<ul><li>') && cur.endsWith('</li></ul>')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('<ul><li>') && lines[i].endsWith('</li></ul>')) {
        items.push(lines[i].replace(/^<ul><li>/, '').replace(/<\/li><\/ul>$/, ''));
        i++;
      }
      result.push(`<ul>${items.map(it => `<li>${it}</li>`).join('')}</ul>`);
      continue;
    }
    if (cur.startsWith('<ol><li>') && cur.endsWith('</li></ol>')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('<ol><li>') && lines[i].endsWith('</li></ol>')) {
        items.push(lines[i].replace(/^<ol><li>/, '').replace(/<\/li><\/ol>$/, ''));
        i++;
      }
      result.push(`<ol>${items.map(it => `<li>${it}</li>`).join('')}</ol>`);
      continue;
    }
    result.push(cur);
    i++;
  }
  return result;
}

/**
 * 对指定文本片段应用 LaTeX 标记（用于工具栏按钮）
 * 返回可直接插入到 HTML 输出中的字符串
 */
export function buildLatexHtml(text: string, type: LatexType, opts: FormatOptions): string {
  const escaped = escapeHtml(text);
  switch (type) {
    case 'color':
      return `<span style="color:${opts.latexColor}">${escaped}</span>`;
    case 'border':
      return `<span style="background:${opts.latexBgColor};border:1px solid ${opts.latexBorderColor};padding:2px 6px;border-radius:3px">${escaped}</span>`;
    case 'underline':
      return `<span style="text-decoration:underline;text-decoration-color:${opts.latexColor};text-decoration-thickness:2px">${escaped}</span>`;
    case 'box':
      return `<span style="border:2px solid ${opts.latexBorderColor};padding:2px 8px;border-radius:6px">${escaped}</span>`;
  }
}
