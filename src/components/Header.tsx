import { Github, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        {/* Logo: 蓝色印章「排」字 */}
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-zhihu-blue shadow-md">
          <span className="font-serif text-2xl font-black text-white">排</span>
          <div className="absolute inset-1 rounded-lg border border-white/25" />
        </div>
        <div>
          <h1 className="font-serif text-lg font-bold leading-tight text-zhihu-ink">
            知乎排版助手
          </h1>
          <p className="text-xs text-gray-500">
            一键将草稿转换为符合知乎编辑器规则的精美富文本
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-1.5 rounded-full bg-zhihu-amber-light px-3 py-1 text-xs font-medium text-zhihu-amber sm:flex">
          <Sparkles size={12} />
          支持标题识别 · 关键词加粗 · LaTeX 标记
        </div>
        <a
          href="https://github.com/anderson6666/paiban"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-zhihu-ink"
          title="GitHub 仓库"
        >
          <Github size={18} />
          <span className="hidden text-sm font-medium sm:inline">GitHub</span>
        </a>
      </div>
    </header>
  );
}
