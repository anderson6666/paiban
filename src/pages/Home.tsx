import { Header } from '@/components/Header';
import { Toolbar } from '@/components/Toolbar';
import { InputPanel } from '@/components/InputPanel';
import { OutputPanel } from '@/components/OutputPanel';
import { Toast } from '@/components/Toast';

export default function Home() {
  return (
    <div className="min-h-screen bg-zhihu-paper">
      <Header />

      <main className="mx-auto max-w-[1440px] px-4 pb-6 sm:px-6">
        <Toolbar />

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
          <div className="h-[calc(100vh-220px)] min-h-[420px]">
            <InputPanel />
          </div>
          <div className="h-[calc(100vh-220px)] min-h-[420px]">
            <OutputPanel />
          </div>
        </div>

        <footer className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <span>知乎排版助手</span>
          <span className="text-gray-300">·</span>
          <span>纯前端 · 数据不出浏览器</span>
          <span className="text-gray-300">·</span>
          <a
            href="https://github.com/anderson6666/paiban"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-zhihu-blue"
          >
            源代码
          </a>
        </footer>
      </main>

      <Toast />
    </div>
  );
}
