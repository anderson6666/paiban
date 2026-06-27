import { create } from 'zustand';
import { formatAll, FormatOptions, DEFAULT_OPTIONS, LatexType } from '@/utils/formatEngine';

interface FormatState {
  input: string;
  outputHtml: string;
  outputMarkdown: string;
  options: FormatOptions;
  selection: { start: number; end: number; selectedText: string };
  toast: { message: string; type: 'success' | 'error' } | null;

  setInput: (text: string) => void;
  setSelection: (sel: { start: number; end: number }) => void;
  format: () => void;
  clear: () => void;
  applyLatexToSelection: (type: LatexType) => void;
  toggleOption: (key: keyof FormatOptions) => void;
  setToast: (toast: { message: string; type: 'success' | 'error' } | null) => void;
}

export const useFormatStore = create<FormatState>((set, get) => ({
  input: '',
  outputHtml: '',
  outputMarkdown: '',
  options: { ...DEFAULT_OPTIONS },
  selection: { start: 0, end: 0, selectedText: '' },
  toast: null,

  setInput: (text) => {
    set({ input: text });
  },

  setSelection: (sel) => {
    const { input } = get();
    const selectedText = input.slice(sel.start, sel.end);
    set({ selection: { ...sel, selectedText } });
  },

  format: () => {
    const { input, options } = get();
    if (!input.trim()) {
      set({ toast: { message: '请先输入待排版的文字', type: 'error' } });
      return;
    }
    const { html, markdown } = formatAll(input, options);
    set({ outputHtml: html, outputMarkdown: markdown, toast: { message: '排版完成', type: 'success' } });
  },

  clear: () => {
    set({ input: '', outputHtml: '', outputMarkdown: '', selection: { start: 0, end: 0, selectedText: '' } });
  },

  applyLatexToSelection: (type) => {
    const { input, selection, options } = get();
    if (selection.start === selection.end) {
      set({ toast: { message: '请先在输入框中选中要标记的文字', type: 'error' } });
      return;
    }
    const before = input.slice(0, selection.start);
    const selected = input.slice(selection.start, selection.end);
    const after = input.slice(selection.end);

    // 插入带类型前缀的标记，排版时自动识别转换
    const newInput = before + `【${type}:${selected}】` + after;
    set({ input: newInput });

    // 即时排版预览
    const { html, markdown } = formatAll(newInput, options);
    set({ outputHtml: html, outputMarkdown: markdown, toast: { message: '已应用 LaTeX 标记', type: 'success' } });
  },

  toggleOption: (key) => {
    const { options, input } = get();
    const newOptions = { ...options, [key]: !options[key] };
    set({ options: newOptions });
    // 若已有输出，则重新排版
    if (get().outputHtml && input) {
      const { html, markdown } = formatAll(input, newOptions);
      set({ outputHtml: html, outputMarkdown: markdown });
    }
  },

  setToast: (toast) => set({ toast }),
}));
