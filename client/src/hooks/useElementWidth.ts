import { useCallback, useEffect, useState } from 'react'

/** Отслеживает ширину элемента — реагирует на сайдбар, колонки и ресайз окна. */
export function useElementWidth<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null)
  const [width, setWidth] = useState(0)

  const remeasure = useCallback(() => {
    if (node) setWidth(node.getBoundingClientRect().width)
  }, [node])

  useEffect(() => {
    if (!node) return

    remeasure()
    const observer = new ResizeObserver(remeasure)
    observer.observe(node)
    window.addEventListener('resize', remeasure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', remeasure)
    }
  }, [node, remeasure])

  return { ref: setNode, width, remeasure }
}
