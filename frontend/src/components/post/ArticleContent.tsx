import type { ArticleBlock } from '../../data/mockArticleDetails'

type ArticleContentProps = {
  blocks: ArticleBlock[]
}

function ArticleContent({ blocks }: ArticleContentProps) {
  return (
    <div className="py-8 font-reading text-[1.0625rem] leading-8 text-[var(--color-text)] sm:py-10">
      {blocks.map((block, index) => {
        if (block.type === 'paragraph') {
          return (
            <p
              key={`${block.type}-${index}`}
              className={
                block.lead
                  ? 'mx-auto mb-7 max-w-[680px] text-lg leading-8 text-[var(--color-text)]'
                  : 'mx-auto my-6 max-w-[680px] text-[1.0625rem] leading-8 text-[var(--color-text)]'
              }
            >
              {block.text}
            </p>
          )
        }

        if (block.type === 'heading') {
          return (
            <h2
              key={`${block.type}-${index}`}
              className="mx-auto mb-4 mt-10 max-w-[680px] font-reading text-xl font-bold leading-snug text-[var(--color-text)] sm:text-2xl"
            >
              {block.text}
            </h2>
          )
        }

        if (block.type === 'quote') {
          return (
            <blockquote
              key={`${block.type}-${index}`}
              className="mx-auto my-8 max-w-[680px] border-l-4 border-[var(--color-border-soft)] bg-[var(--color-card-elevated)] px-5 py-4"
            >
              <p className="font-reading text-lg italic leading-8 text-[var(--color-text)]">
                "{block.text}"
              </p>
            </blockquote>
          )
        }

        if (block.type === 'note') {
          return (
            <aside
              key={`${block.type}-${index}`}
              className="mx-auto my-8 max-w-[680px] rounded-2xl border border-[#EBCAB8] bg-[#FFF1E8] px-5 py-4 dark:border-[#5A3828] dark:bg-[#2B1D16]"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                Highlighted note
              </p>
              <p className="mt-2 font-reading text-base leading-8 text-[var(--color-text)]">
                {block.text}
              </p>
            </aside>
          )
        }

        if (block.type === 'divider') {
          return (
            <div
              key={`${block.type}-${index}`}
              className="mx-auto my-9 h-px w-full max-w-[680px] bg-[var(--color-border)]"
              aria-hidden="true"
            />
          )
        }

        return (
          <ul
            key={`${block.type}-${index}`}
            className="mx-auto my-7 max-w-[680px] space-y-3 border-l border-[var(--color-border)] pl-6 font-reading text-[1.0625rem] leading-8 text-[var(--color-text)]"
          >
            {block.items.map((item) => (
              <li key={item} className="relative pl-4">
                <span className="absolute left-0 top-[0.8rem] h-1.5 w-1.5 rounded-full bg-[#FF6719]" />
                {item}
              </li>
            ))}
          </ul>
        )
      })}
    </div>
  )
}

export default ArticleContent
