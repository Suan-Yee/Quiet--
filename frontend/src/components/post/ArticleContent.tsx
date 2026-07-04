import type { ArticleBlock } from '../../data/mockArticleDetails'

type ArticleContentProps = {
  blocks: ArticleBlock[]
}

function ArticleContent({ blocks }: ArticleContentProps) {
  return (
    <div className="mt-10 font-reading text-lg leading-9 text-[var(--color-text)]">
      {blocks.map((block, index) => {
        if (block.type === 'paragraph') {
          return (
            <p
              key={`${block.type}-${index}`}
              className={
                block.lead
                  ? 'mb-8 text-xl leading-9 text-[var(--color-text)] sm:text-[1.35rem] sm:leading-10'
                  : 'my-7 text-lg leading-9 text-[var(--color-text)]'
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
              className="mb-4 mt-11 font-reading text-2xl font-bold leading-snug text-[var(--color-text)] sm:text-3xl"
            >
              {block.text}
            </h2>
          )
        }

        if (block.type === 'quote') {
          return (
            <blockquote
              key={`${block.type}-${index}`}
              className="my-9 border-l-4 border-[var(--color-border-soft)] bg-[var(--color-card-elevated)] px-6 py-5 shadow-sm shadow-[#1F2933]/5 dark:shadow-black/10"
            >
              <p className="font-reading text-xl italic leading-9 text-[var(--color-text)]">
                "{block.text}"
              </p>
            </blockquote>
          )
        }

        if (block.type === 'note') {
          return (
            <aside
              key={`${block.type}-${index}`}
              className="my-8 rounded-2xl border border-[#EBCAB8] bg-[#FFF1E8] px-5 py-4"
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
              className="my-10 h-px w-full bg-[#E8E1D8]"
              aria-hidden="true"
            />
          )
        }

        return (
          <ul
            key={`${block.type}-${index}`}
            className="my-8 space-y-3 border-l border-[var(--color-border)] pl-6 font-reading text-lg leading-8 text-[var(--color-text)]"
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
