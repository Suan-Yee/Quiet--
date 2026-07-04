import type { ReactNode } from 'react'
import type { JSONContent } from '@tiptap/react'

type TiptapContentRendererProps = {
  content: JSONContent
}

function renderMarks(text: string, marks: JSONContent['marks'] = []) {
  return marks.reduce<ReactNode>((currentValue, mark) => {
    if (mark.type === 'bold') {
      return <strong>{currentValue}</strong>
    }

    if (mark.type === 'italic') {
      return <em>{currentValue}</em>
    }

    if (mark.type === 'highlight') {
      return <mark className="rounded bg-[var(--color-soft-accent)] px-1 text-[var(--color-text)]">{currentValue}</mark>
    }

    return currentValue
  }, text)
}

function renderInline(nodes: JSONContent[] = []) {
  return nodes.map((node, index) => {
    if (node.type === 'text') {
      return <span key={index}>{renderMarks(node.text ?? '', node.marks)}</span>
    }

    if (node.type === 'hardBreak') {
      return <br key={index} />
    }

    return <span key={index}>{renderInline(node.content)}</span>
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
          className="my-8 rounded-2xl border border-[#EBCAB8] bg-[#FFF1E8] px-5 py-4"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Highlighted note
          </p>
          <p className="mt-2 font-reading text-base leading-8 text-[var(--color-text)]">
            {renderInline(node.content)}
          </p>
        </aside>
      )
    }

    return (
      <p
        key={index}
        className={index === 0 ? 'mb-8 text-xl leading-9 sm:text-[1.35rem] sm:leading-10' : 'my-7 text-lg leading-9'}
      >
        {isEmpty ? <br /> : renderInline(node.content)}
      </p>
    )
  }

  if (node.type === 'heading') {
    const level = node.attrs?.level

    if (level === 3) {
      return (
        <h3 key={index} className="mb-3 mt-9 font-reading text-xl font-bold leading-snug text-[var(--color-text)] sm:text-2xl">
          {renderInline(node.content)}
        </h3>
      )
    }

    return (
      <h2 key={index} className="mb-4 mt-11 font-reading text-2xl font-bold leading-snug text-[var(--color-text)] sm:text-3xl">
        {renderInline(node.content)}
      </h2>
    )
  }

  if (node.type === 'blockquote') {
    return (
      <blockquote
        key={index}
        className="my-9 border-l-4 border-[var(--color-border-soft)] bg-[var(--color-card-elevated)] px-6 py-5 font-reading text-xl italic leading-9 text-[var(--color-text)] shadow-sm shadow-[#1F2933]/5 dark:shadow-black/10"
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
        className={`my-8 space-y-3 border-l border-[var(--color-border)] pl-6 font-reading text-lg leading-8 text-[var(--color-text)] ${
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
    return <div key={index} className="my-10 h-px w-full bg-[#E8E1D8]" aria-hidden="true" />
  }

  if (node.type === 'image') {
    return (
      <img
        key={index}
        src={node.attrs?.src}
        alt={node.attrs?.alt ?? ''}
        className="my-8 max-h-96 w-full rounded-2xl border border-[var(--color-border)] object-cover"
      />
    )
  }

  return <div key={index}>{node.content?.map(renderBlock)}</div>
}

function TiptapContentRenderer({ content }: TiptapContentRendererProps) {
  return (
    <div className="mt-10 font-reading text-lg leading-9 text-[var(--color-text)]">
      {content.content?.map(renderBlock)}
    </div>
  )
}

export default TiptapContentRenderer
