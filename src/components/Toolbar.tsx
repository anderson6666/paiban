import { useFormatStore } from '@/store/useFormatStore';
import { LatexType } from '@/utils/formatEngine';
import { Wand2, Bold, Brackets, Minus, Square, Type as TypeIcon, Heading1, ListTree, Sparkles } from 'lucide-react';

interface LatexBtn {
  type: LatexType;
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
}

const LATEX_BUTTONS: LatexBtn[] = [
  {
    type: 'color',
    label: '变色',
    desc: '文字颜色高亮',
    icon: <TypeIcon size={14} />,
    color: '#FF9600',
  },
  {
    type: 'border',
    label: '边框底色',
    desc: '背景色 + 边框',
    icon: <Brackets size={14} />,
    color: '#FF9600',
  },
  {
    type: 'underline',
    label: '单线划线',
    desc: '下划线标记',
    icon: <Minus size={14} />,
    color: '#FF9600',
  },
  {
    type: 'box',
    label: '框住',
    desc: '蓝框包裹',
    icon: <Square size={14} />,
    color: '#0066FF',
  },
];

export function Toolbar() {
  const format = useFormatStore((s) => s.format);
  const applyLatex = useFormatStore((s) => s.applyLatexToSelection);
  const options = useFormatStore((s) => s.options);
  const toggleOption = useFormatStore((s) => s.toggleOption);
  const input = useFormatStore((s) => s.input);
  const outputHtml = useFormatStore((s) => s.outputHtml);

  const hasContent = !!input.trim();
  const hasOutput = !!outputHtml;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-paper">
      {/* 一键排版主按钮 */}
      <button
        onClick={format}
        disabled={!hasContent}
        className="group flex items-center gap-2 rounded-md bg-zhihu-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zhihu-blue-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-sm"
      >
        <Wand2 size={16} className="transition group-hover:rotate-12" />
        一键排版
      </button>

      <div className="h-6 w-px bg-zhihu-line" />

      {/* 排版规则开关 */}
      <div className="flex items-center gap-1">
        <RuleToggle
          active={options.formatHeadings}
          onClick={() => toggleOption('formatHeadings')}
          icon={<Heading1 size={14} />}
          label="标题识别"
          disabled={!hasContent}
        />
        <RuleToggle
          active={options.boldKeywords}
          onClick={() => toggleOption('boldKeywords')}
          icon={<Bold size={14} />}
          label="关键词加粗"
          disabled={!hasContent}
        />
        <RuleToggle
          active={options.breakSentences}
          onClick={() => toggleOption('breakSentences')}
          icon={<ListTree size={14} />}
          label="短句换行"
          disabled={!hasContent}
        />
        <RuleToggle
          active={options.autoLatex}
          onClick={() => toggleOption('autoLatex')}
          icon={<Sparkles size={14} />}
          label="自动LaTeX"
          disabled={!hasContent}
        />
      </div>

      <div className="h-6 w-px bg-zhihu-line" />

      {/* LaTeX 标记按钮组 */}
      <div className="flex items-center gap-1">
        <span className="mr-1 text-xs font-medium text-gray-500">LaTeX 标记</span>
        {LATEX_BUTTONS.map((btn) => (
          <button
            key={btn.type}
            onClick={() => applyLatex(btn.type)}
            disabled={!hasContent}
            title={btn.desc}
            className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:border-current hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ color: btn.color }}
          >
            {btn.icon}
            {btn.label}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
        {hasOutput ? (
          <span className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
            已就绪
          </span>
        ) : (
          <span>选中文字后点击 LaTeX 按钮可应用标记</span>
        )}
      </div>
    </div>
  );
}

interface RuleToggleProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}

function RuleToggle({ active, onClick, icon, label, disabled }: RuleToggleProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'bg-zhihu-blue-light text-zhihu-blue'
          : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {icon}
      {label}
      <span
        className={`ml-0.5 inline-block h-1.5 w-1.5 rounded-full ${
          active ? 'bg-zhihu-blue' : 'bg-gray-300'
        }`}
      />
    </button>
  );
}
