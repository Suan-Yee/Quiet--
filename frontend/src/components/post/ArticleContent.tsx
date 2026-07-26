import type { ArticleBlock } from '../../data/mockArticleDetails'

type ArticleContentProps = {
  blocks: ArticleBlock[]
}

function ArticleContent({ blocks }: ArticleContentProps) {
  return (
    <div className="mx-auto max-w-[720px] py-10 font-reading text-[1.125rem] leading-[1.85] text-[var(--color-text)] sm:py-14 sm:text-[1.1875rem]">
      {blocks.map((block, index) => {
        if (block.type === 'paragraph') {
          return (
            <p
              key={`${block.type}-${index}`}
              className={
                block.lead
                  ? 'mb-10 text-[1.3rem] leading-[1.75] text-[var(--color-secondary)] sm:text-[1.45rem]'
                  : 'my-7'
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
              className="mb-5 mt-14 font-reading text-3xl font-semibold leading-tight tracking-[-0.02em] text-[var(--color-text)] sm:text-4xl"
            >
              {block.text}
            </h2>
          )
        }

        if (block.type === 'quote') {
          return (
            <blockquote
              key={`${block.type}-${index}`}
              className="my-12 border-y border-[var(--color-border-soft)] py-8 text-center"
            >
              <p className="font-reading text-2xl font-medium italic leading-[1.55] text-[var(--color-text)] sm:text-3xl">
                “{block.text}”
              </p>
            </blockquote>
          )
        }

        if (block.type === 'note') {
          return (
            <aside
              key={`${block.type}-${index}`}
              className="my-10 rounded-3xl border border-[var(--color-border-soft)] bg-[var(--color-soft-accent)] px-6 py-6 sm:px-8"
            >
              <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                Margin note
              </p>
              <p className="mt-3 text-lg leading-8 text-[var(--color-text)]">{block.text}</p>
            </aside>
          )
        }

        if (block.type === 'divider') {
          return (
            <div
              key={`${block.type}-${index}`}
              className="mx-auto my-14 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]"
              aria-hidden="true"
            />
          )
        }

        return (
          <ul
            key={`${block.type}-${index}`}
            className="my-9 list-disc space-y-4 pl-7 marker:text-[var(--color-accent)]"
          >
            {block.items.map((item) => (
              <li key={item} className="pl-2">
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
