import type { ReactNode } from 'react'
import type { JSONContent } from '@tiptap/react'

type TiptapContentRendererProps = {
  content: JSONContent
}

function renderMarks(text: string, marks: JSONContent['marks'] = [], showHighlight = true) {
  return marks.reduce<ReactNode>((currentValue, mark) => {
    if (mark.type === 'bold') {
      return <strong>{currentValue}</strong>
    }

    if (mark.type === 'italic') {
      return <em>{currentValue}</em>
    }

    if (mark.type === 'highlight' && showHighlight) {
      return (
        <mark className="rounded bg-[var(--color-soft-accent)] px-1 text-[var(--color-text)] dark:bg-[#6A3A22] dark:text-[#FFF7F0]">
          {currentValue}
        </mark>
      )
    }

    return currentValue
  }, text)
}

function renderInline(nodes: JSONContent[] = [], showHighlight = true) {
  return nodes.map((node, index) => {
    if (node.type === 'text') {
      return <span key={index}>{renderMarks(node.text ?? '', node.marks, showHighlight)}</span>
    }

    if (node.type === 'hardBreak') {
      return <br key={index} />
    }

    return <span key={index}>{renderInline(node.content, showHighlight)}</span>
  })
}

function hasMark(node: JSONContent, markType: string) {
  return node.marks?.some((mark) => mark.type === markType) ?? false
}

function isHighlightedNote(node: JSONContent) {
  const inlineNodes = node.content ?? []

  return (
    inlineNodes.length > 0 &&
    inlineNodes.every((childNode) => childNode.type !== 'text' || hasMark(childNode, 'highlight'))
  )
}

function renderBlock(node: JSONContent, index: number) {
  if (node.type === 'paragraph') {
    const isEmpty = !node.content?.length

    if (!isEmpty && isHighlightedNote(node)) {
      return (
        <aside
          key={index}
          className="mx-auto my-8 max-w-[680px] rounded-2xl border border-[#EBCAB8] bg-[#FFF1E8] px-5 py-4 dark:border-[#5A3828] dark:bg-[#2B1D16]"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Highlighted note
          </p>
          <p className="mt-2 font-reading text-base leading-8 text-[var(--color-text)]">
            {renderInline(node.content, false)}
          </p>
        </aside>
      )
    }

    return (
      <p
        key={index}
        className={
          index === 0
            ? 'mx-auto mb-7 max-w-[680px] text-lg leading-8'
            : 'mx-auto my-6 max-w-[680px] text-[1.0625rem] leading-8'
        }
      >
        {isEmpty ? <br /> : renderInline(node.content)}
      </p>
    )
  }

  if (node.type === 'heading') {
    const level = node.attrs?.level

    if (level === 3) {
      return (
        <h3 key={index} className="mx-auto mb-3 mt-9 max-w-[680px] font-reading text-lg font-bold leading-snug text-[var(--color-text)] sm:text-xl">
          {renderInline(node.content)}
        </h3>
      )
    }

    return (
      <h2 key={index} className="mx-auto mb-4 mt-10 max-w-[680px] font-reading text-xl font-bold leading-snug text-[var(--color-text)] sm:text-2xl">
        {renderInline(node.content)}
      </h2>
    )
  }

  if (node.type === 'blockquote') {
    return (
      <blockquote
        key={index}
        className="mx-auto my-8 max-w-[680px] border-l-4 border-[var(--color-border-soft)] bg-[var(--color-card-elevated)] px-5 py-4 font-reading text-lg italic leading-8 text-[var(--color-text)]"
      >
        {node.content?.map((childNode, childIndex) => (
          <div key={childIndex}>{renderInline(childNode.content)}</div>
        ))}
      </blockquote>
    )
  }

  if (node.type === 'bulletList' || node.type === 'orderedList') {
    const ListTag = node.type === 'bulletList' ? 'ul' : 'ol'

    return (
      <ListTag
        key={index}
        className={`mx-auto my-7 max-w-[680px] space-y-3 border-l border-[var(--color-border)] pl-6 font-reading text-[1.0625rem] leading-8 text-[var(--color-text)] ${
          node.type === 'orderedList' ? 'list-decimal' : ''
        }`}
      >
        {node.content?.map((item, itemIndex) => (
          <li key={itemIndex} className={node.type === 'bulletList' ? 'relative pl-4' : 'ml-5 pl-2'}>
            {node.type === 'bulletList' ? (
              <span className="absolute left-0 top-[0.8rem] h-1.5 w-1.5 rounded-full bg-[#FF6719]" />
            ) : null}
            {item.content?.map((childNode, childIndex) => (
              <span key={childIndex}>{renderInline(childNode.content)}</span>
            ))}
          </li>
        ))}
      </ListTag>
    )
  }

  if (node.type === 'horizontalRule') {
    return <div key={index} className="mx-auto my-9 h-px w-full max-w-[680px] bg-[var(--color-border)]" aria-hidden="true" />
  }

  if (node.type === 'image') {
    const caption = typeof node.attrs?.title === 'string' ? node.attrs.title.trim() : ''

    return (
      <figure key={index} className="mx-auto my-9 max-w-[640px]">
        <img
          src={node.attrs?.src}
          alt={node.attrs?.alt ?? ''}
          className="max-h-[32rem] w-full rounded-2xl bg-[var(--color-bg)] object-contain"
        />
        {caption ? (
          <figcaption className="mx-auto mt-2 max-w-[680px] px-2 text-center font-sans text-sm leading-6 text-[var(--color-secondary)]">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    )
  }

  return <div key={index}>{node.content?.map(renderBlock)}</div>
}

function TiptapContentRenderer({ content }: TiptapContentRendererProps) {
  return (
    <div className="py-8 font-reading text-[1.0625rem] leading-8 text-[var(--color-text)] sm:py-10">
      {content.content?.map(renderBlock)}
    </div>
  )
}

export default TiptapContentRenderer
