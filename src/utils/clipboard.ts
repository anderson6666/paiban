// 剪贴板工具：支持富文本(HTML)与纯文本(Markdown)双模式

/**
 * 复制富文本到剪贴板（保留 HTML 样式，可粘贴到知乎编辑器）
 * 使用 Selection + ClipboardEvent 方案，兼容性最佳
 */
export async function copyRichText(html: string): Promise<boolean> {
  // 优先尝试现代 Clipboard API
  if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
    try {
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([htmlToText(html)], { type: 'text/plain' }),
      });
      await navigator.clipboard.write([clipboardItem]);
      return true;
    } catch {
      // 降级到 Selection 方案
    }
  }

  // 降级方案：创建临时容器 + Selection + execCommand
  try {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.opacity = '0';
    container.innerHTML = html;
    document.body.appendChild(container);

    const range = document.createRange();
    range.selectNodeContents(container);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    const ok = document.execCommand('copy');
    document.body.removeChild(container);
    selection?.removeAllRanges();
    return ok;
  } catch {
    return false;
  }
}

/**
 * 复制纯文本到剪贴板
 */
export async function copyPlainText(text: string): Promise<boolean> {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 降级
    }
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/**
 * HTML 转纯文本（用于 clipboard 的 text/plain fallback）
 */
function htmlToText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.innerText || div.textContent || '';
}
