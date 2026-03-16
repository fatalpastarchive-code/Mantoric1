"use client"

import { useEffect, useRef, useCallback, ReactNode } from "react"
import { Loader2 } from "lucide-react"

interface InfiniteScrollProps {
  children: ReactNode
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  loaderClassName?: string
}

export function InfiniteScroll({
  children,
  hasMore,
  isLoading,
  onLoadMore,
  loaderClassName = "py-8"
}: InfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore()
      }
    },
    [hasMore, isLoading, onLoadMore]
  )

  useEffect(() => {
    const element = loadMoreRef.current
    if (!element) return

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: "100px"
    })

    observerRef.current.observe(element)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleObserver])

  return (
    <>
      {children}
      
      {hasMore && (
        <div ref={loadMoreRef} className={loaderClassName}>
          {isLoading && (
            <div className="flex justify-center items-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}
    </>
  )
}
