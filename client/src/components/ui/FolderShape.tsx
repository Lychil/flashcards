import { useId } from 'react'

interface FolderShapeProps {
  color: string
}

export function FolderShape({ color }: FolderShapeProps) {
  const clipId = useId()

  return (
    <>
      <svg className="absolute h-0 w-0" aria-hidden>
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d="M 0.09,0 H 0.56 C 0.61,0 0.64,0.02 0.66,0.19 H 0.91 C 0.96,0.19 1,0.23 1,0.28 V 0.91 C 1,0.96 0.96,1 0.91,1 H 0.09 C 0.04,1 0,0.96 0,0.91 V 0.09 C 0,0.04 0.04,0 0.09,0 Z" />
          </clipPath>
        </defs>
      </svg>
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: color,
          clipPath: `url(#${clipId})`,
        }}
      />
    </>
  )
}
