import { useRef, useEffect } from 'react';
import { useFormatStore } from '@/store/useFormatStore';
import { Eraser, Type } from 'lucide-react';

interface Props {
  onSelectionChange?: () => void;
}

export function InputPanel({ onSelectionChange }: Props) {
  const input = useFormatStore((s) => s.input);
  const setInput = useFormatStore((s) => s.setInput);
  const clear = useFormatStore((s) => s.clear);
  const setSelection = useFormatStore((s) => s.setSelection);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 字数统计
  const charCount = input.length;
  const lineCount = input ? input.split('\n').length : 0;

  // 监听选区变化
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const handler = () => {
      const start = ta.selectionStart ?? 0;
      const end = ta.selectionEnd ?? 0;
      setSelection({ start, end });
      onSelectionChange?.();
    };
    ta.addEventListener('select', handler);
    ta.addEventListener('mouseup', handler);
    ta.addEventListener('keyup', handler);
    return () => {
      ta.removeEventListener('select', handler);
      ta.removeEventListener('mouseup', handler);
      ta.removeEventListener('keyup', handler);
    };
  }, [setSelection, onSelectionChange]);

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-paper">
      <header className="flex items-center justify-between border-b border-zhihu-line px-4 py-3">
        <div className="flex items-center gap-2 text-zhihu-ink">
          <Type size={16} className="text-zhihu-blue" />
          <h2 className="text-sm font-semibold tracking-wide">原始草稿</h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{charCount} 字</span>
          <span className="text-gray-300">|</span>
          <span>{lineCount} 行</span>
          <button
            onClick={clear}
            disabled={!input}
            className="ml-2 flex items-center gap-1 rounded px-2 py-1 text-gray-500 transition hover:bg-gray-100 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
            title="清空"
          >
            <Eraser size={13} />
            清空
          </button>
        </div>
      </header>
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="在此粘贴你的草稿…&#10;&#10;支持 Markdown 语法：# 标题、- 列表、> 引用、```代码块```&#10;支持中文序号自动识别：一、 二、 1. 第二章&#10;选中文字后点击下方 LaTeX 按钮可应用标记"
        spellCheck={false}
        className="flex-1 resize-none bg-transparent px-5 py-4 font-sans text-[15px] leading-[1.85] text-zhihu-ink placeholder:text-gray-400"
        style={{ fontFamily: '"Source Han Sans SC", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif' }}
      />
    </section>
  );
}
