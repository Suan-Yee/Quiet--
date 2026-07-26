import type { ReactNode } from 'react'
import type { JSONContent } from '@tiptap/react'

type TiptapContentRendererProps = {
  content: JSONContent
}

function getNodeText(node: JSONContent): string {
  if (node.type === 'text') {
    return node.text ?? ''
  }

  return node.content?.map(getNodeText).join('') ?? ''
}

function getSafeHref(value: unknown) {
  if (typeof value !== 'string') {
    return undefined
  }

  const href = value.trim()

  if (/^(https?:|mailto:|#|\/)/i.test(href)) {
    return href
  }

  return undefined
}

function renderMarks(text: string, marks: JSONContent['marks'] = [], showHighlight = true) {
  return marks.reduce<ReactNode>((currentValue, mark) => {
    if (mark.type === 'bold') {
      return <strong className="font-semibold">{currentValue}</strong>
    }

    if (mark.type === 'italic') {
      return <em>{currentValue}</em>
    }

    if (mark.type === 'strike') {
      return <s>{currentValue}</s>
    }

    if (mark.type === 'code') {
      return (
        <code className="rounded-md bg-[var(--color-card-elevated)] px-1.5 py-0.5 font-mono text-[0.88em] text-[var(--color-text)]">
          {currentValue}
        </code>
      )
    }

    if (mark.type === 'link') {
      const href = getSafeHref(mark.attrs?.href)

      if (!href) {
        return currentValue
      }

      return (
        <a
          href={href}
          className="font-medium text-[var(--color-accent)] underline decoration-[var(--color-border-soft)] decoration-2 underline-offset-4 transition hover:decoration-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          {currentValue}
        </a>
      )
    }

    if (mark.type === 'highlight' && showHighlight) {
      return (
        <mark className="rounded bg-[var(--color-highlight)] px-1 text-[var(--color-brand-panel)]">
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

function renderList(node: JSONContent, index: number, isNested = false) {
  const ListTag = node.type === 'orderedList' ? 'ol' : 'ul'
  const listStyle = node.type === 'orderedList' ? 'list-decimal' : 'list-disc'

  return (
    <ListTag
      key={index}
      className={`${listStyle} space-y-3 pl-7 marker:font-sans marker:font-semibold marker:text-[var(--color-accent)] ${
        isNested ? 'mt-3 text-[0.96em]' : 'my-9'
      }`}
    >
      {node.content?.map((item, itemIndex) => (
        <li key={itemIndex} className="pl-2">
          {item.content?.map((childNode, childIndex) => {
            if (childNode.type === 'paragraph') {
              return <span key={childIndex}>{renderInline(childNode.content)}</span>
            }

            if (childNode.type === 'bulletList' || childNode.type === 'orderedList') {
              return renderList(childNode, childIndex, true)
            }

            return renderBlock(childNode, childIndex)
          })}
        </li>
      ))}
    </ListTag>
  )
}

function renderBlock(node: JSONContent, index: number): ReactNode {
  if (node.type === 'paragraph') {
    const isEmpty = !node.content?.length

    if (!isEmpty && isHighlightedNote(node)) {
      return (
        <aside
          key={index}
          className="my-10 rounded-3xl border border-[var(--color-border-soft)] bg-[var(--color-soft-accent)] px-6 py-6 sm:px-8"
        >
          <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Margin note
          </p>
          <p className="mt-3 text-lg leading-8 text-[var(--color-text)]">
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
            ? 'mb-10 text-[1.3rem] leading-[1.75] text-[var(--color-secondary)] sm:text-[1.45rem]'
            : 'my-7'
        }
      >
        {isEmpty ? <br /> : renderInline(node.content)}
      </p>
    )
  }

  if (node.type === 'heading') {
    const level = Number(node.attrs?.level)
    const headingText = getNodeText(node)
    const headingId = `${headingText
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'section'}-${index}`

    if (level >= 3) {
      return (
        <h3
          key={index}
          id={headingId}
          className="mb-4 mt-12 scroll-mt-28 font-reading text-2xl font-semibold leading-tight tracking-[-0.015em] text-[var(--color-text)] sm:text-3xl"
        >
          {renderInline(node.content)}
        </h3>
      )
    }

    return (
      <h2
        key={index}
        id={headingId}
        className="mb-5 mt-14 scroll-mt-28 font-reading text-3xl font-semibold leading-tight tracking-[-0.02em] text-[var(--color-text)] sm:text-4xl"
      >
        {renderInline(node.content)}
      </h2>
    )
  }

  if (node.type === 'blockquote') {
    return (
      <blockquote
        key={index}
        className="my-12 border-y border-[var(--color-border-soft)] py-8 text-center font-reading text-2xl font-medium italic leading-[1.55] text-[var(--color-text)] sm:text-3xl"
      >
        {node.content?.map((childNode, childIndex) => (
          <p key={childIndex}>{renderInline(childNode.content)}</p>
        ))}
      </blockquote>
    )
  }

  if (node.type === 'bulletList' || node.type === 'orderedList') {
    return renderList(node, index)
  }

  if (node.type === 'horizontalRule') {
    return (
      <div key={index} className="my-14 flex justify-center" aria-hidden="true">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
      </div>
    )
  }

  if (node.type === 'codeBlock') {
    return (
      <pre
        key={index}
        className="theme-scrollbar my-9 overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-brand-panel)] p-5 text-sm leading-7 text-[var(--color-on-brand)]"
      >
        <code>{getNodeText(node)}</code>
      </pre>
    )
  }

  if (node.type === 'image') {
    const caption = typeof node.attrs?.title === 'string' ? node.attrs.title.trim() : ''
    const src = typeof node.attrs?.src === 'string' ? node.attrs.src : ''

    if (!src) {
      return null
    }

    return (
      <figure key={index} className="my-12">
        <img
          src={src}
          alt={typeof node.attrs?.alt === 'string' ? node.attrs.alt : ''}
          loading="lazy"
          decoding="async"
          className="max-h-[36rem] w-full rounded-3xl bg-[var(--color-card-elevated)] object-contain"
        />
        {caption ? (
          <figcaption className="mx-auto mt-3 max-w-[40rem] px-2 text-center font-sans text-sm leading-6 text-[var(--color-secondary)]">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    )
  }

  return <div key={index}>{node.content?.map((childNode, childIndex) => renderBlock(childNode, childIndex))}</div>
}

function TiptapContentRenderer({ content }: TiptapContentRendererProps) {
  return (
    <div className="mx-auto max-w-[720px] py-10 font-reading text-[1.125rem] leading-[1.85] text-[var(--color-text)] sm:py-14 sm:text-[1.1875rem]">
      {content.content?.map((node, index) => renderBlock(node, index))}
    </div>
  )
}

export default TiptapContentRenderer
