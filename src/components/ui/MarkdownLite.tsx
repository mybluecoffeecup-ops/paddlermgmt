// Minimal markdown-lite renderer for workout programs: headings, bullet
// lists, bold text, and paragraphs. Not a full CommonMark implementation.

function renderInline(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export function MarkdownLite({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={blocks.length} className="ml-4 list-disc space-y-0.5">
        {listItems.map((item, i) => (
          <li
            key={i}
            dangerouslySetInnerHTML={{ __html: renderInline(item) }}
          />
        ))}
      </ul>
    );
    listItems = [];
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("## ")) {
      flushList();
      blocks.push(
        <h3 key={blocks.length} className="mt-3 text-sm font-bold text-green-700 first:mt-0 dark:text-green-300">
          {trimmed.slice(3)}
        </h3>
      );
    } else if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.slice(2));
    } else if (trimmed.length === 0) {
      flushList();
    } else {
      flushList();
      blocks.push(
        <p
          key={`${blocks.length}-${i}`}
          className="text-sm leading-relaxed text-slate-600 dark:text-slate-300"
          dangerouslySetInnerHTML={{ __html: renderInline(trimmed) }}
        />
      );
    }
  });
  flushList();

  return <div className="space-y-1.5">{blocks}</div>;
}
