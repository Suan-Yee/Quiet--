import type { ImgHTMLAttributes } from 'react'

type PostMediaFrameImageProps = Pick<
  ImgHTMLAttributes<HTMLImageElement>,
  'alt' | 'decoding' | 'loading' | 'src'
> & {
  interactive?: boolean
}

function PostMediaFrameImage({
  alt,
  decoding,
  interactive = false,
  loading,
  src,
}: PostMediaFrameImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      draggable={false}
      className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${
        interactive
          ? 'transition duration-300 group-hover:scale-[1.015]'
          : ''
      }`}
    />
  )
}

export default PostMediaFrameImage
