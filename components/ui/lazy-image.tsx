"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface LazyImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  containerClassName?: string
  priority?: boolean
}

export function LazyImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  containerClassName,
  priority = false
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (priority) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: "200px",
        threshold: 0.1
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  return (
    <div
      ref={imgRef}
      className={cn(
        "relative overflow-hidden bg-secondary/20",
        isLoaded ? "opacity-100" : "opacity-0",
        "transition-opacity duration-300",
        containerClassName
      )}
    >
      {isInView && (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          className={cn(
            "transition-all duration-300",
            isLoaded ? "scale-100 blur-0" : "scale-105 blur-sm",
            className
          )}
          onLoad={() => setIsLoaded(true)}
          priority={priority}
        />
      )}
    </div>
  )
}
