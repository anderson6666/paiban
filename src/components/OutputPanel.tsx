import { useState } from 'react';
import { useFormatStore } from '@/store/useFormatStore';
import { copyRichText, copyPlainText } from '@/utils/clipboard';
import { Copy, FileCode2, Eye, Code2, Check } from 'lucide-react';

type Mode = 'preview' | 'markdown';

export function OutputPanel() {
  const outputHtml = useFormatStore((s) => s.outputHtml);
  const outputMarkdown = useFormatStore((s) => s.outputMarkdown);
  const setToast = useFormatStore((s) => s.setToast);
  const [mode, setMode] = useState<Mode>('preview');
  const [copied, setCopied] = useState<'html' | 'md' | null>(null);

  const handleCopyHtml = async () => {
    if (!outputHtml) {
      setToast({ message: '请先点击「一键排版」生成内容', type: 'error' });
      return;
    }
    const ok = await copyRichText(outputHtml);
    if (ok) {
      setToast({ message: '富文本已复制，可粘贴到知乎', type: 'success' });
      setCopied('html');
      setTimeout(() => setCopied(null), 1600);
    } else {
      setToast({ message: '复制失败，请检查浏览器权限', type: 'error' });
    }
  };

  const handleCopyMd = async () => {
    if (!outputMarkdown) {
      setToast({ message: '请先点击「一键排版」生成内容', type: 'error' });
      return;
    }
    const ok = await copyPlainText(outputMarkdown);
    if (ok) {
      setToast({ message: 'Markdown 已复制', type: 'success' });
      setCopied('md');
      setTimeout(() => setCopied(null), 1600);
    } else {
      setToast({ message: '复制失败，请检查浏览器权限', type: 'error' });
    }
  };

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-paper">
      <header className="flex items-center justify-between border-b border-zhihu-line px-4 py-3">
        <div className="flex items-center gap-1 rounded-md bg-gray-100 p-0.5">
          <button
            onClick={() => setMode('preview')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition ${
              mode === 'preview'
                ? 'bg-white text-zhihu-blue shadow-sm'
                : 'text-gray-500 hover:text-zhihu-ink'
            }`}
          >
            <Eye size={13} />
            预览
          </button>
          <button
            onClick={() => setMode('markdown')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition ${
              mode === 'markdown'
                ? 'bg-white text-zhihu-blue shadow-sm'
                : 'text-gray-500 hover:text-zhihu-ink'
            }`}
          >
            <Code2 size={13} />
            Markdown
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMd}
            disabled={!outputMarkdown}
            className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-zhihu-blue hover:text-zhihu-blue disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied === 'md' ? <Check size={13} /> : <FileCode2 size={13} />}
            MD
          </button>
          <button
            onClick={handleCopyHtml}
            disabled={!outputHtml}
            className="flex items-center gap-1.5 rounded-md bg-zhihu-blue px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-zhihu-blue-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied === 'html' ? <Check size={13} /> : <Copy size={13} />}
            复制富文本
          </button>
        </div>
      </header>

      <div className="relative flex-1 overflow-auto">
        {mode === 'preview' ? (
          outputHtml ? (
            <article
              className="prose-zhihu px-6 py-5 animate-fade-up"
              dangerouslySetInnerHTML={{ __html: outputHtml }}
            />
          ) : (
            <EmptyState />
          )
        ) : (
          <pre className="px-5 py-4 text-[13px] leading-[1.7] text-zhihu-ink whitespace-pre-wrap break-words font-mono">
            {outputMarkdown || '点击「一键排版」生成 Markdown 源码…'}
          </pre>
        )}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
      <div className="rounded-full bg-zhihu-blue-light p-4">
        <Eye size={28} className="text-zhihu-blue" strokeWidth={1.5} />
      </div>
      <p className="text-sm">排版后的预览将显示在此处</p>
      <p className="text-xs text-gray-300">点击工具栏「一键排版」按钮开始</p>
    </div>
  );
}
