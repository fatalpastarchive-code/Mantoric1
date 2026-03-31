"use server"

import type { CulturalType } from "@/lib/db/schema"

export interface UnifiedCulturalResult {
  externalId: string
  title: string
  imageUrl: string
  year?: string
  type: CulturalType
}

const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.TMDB_TOKEN
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY

export async function searchCulturalContent(
  query: string,
  type: CulturalType
): Promise<UnifiedCulturalResult[]> {
  if (!query.trim()) {
    return []
  }

  try {
    if (type === "BOOK") {
      return await searchBooks(query)
    } else {
      return await searchTMDB(query, type)
    }
  } catch (error) {
    console.error("[searchCulturalContent] Error:", error)
    return []
  }
}

async function searchBooks(query: string): Promise<UnifiedCulturalResult[]> {
  if (!GOOGLE_BOOKS_API_KEY) {
    console.error("[searchBooks] GOOGLE_BOOKS_API_KEY not set")
    return []
  }

  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${GOOGLE_BOOKS_API_KEY}&maxResults=10`

  const response = await fetch(url)
  if (!response.ok) {
    console.error("[searchBooks] API error:", response.status, response.statusText)
    return []
  }

  const data = await response.json()

  if (!data.items || !Array.isArray(data.items)) {
    return []
  }

  return data.items.map((item: any) => {
    const volumeInfo = item.volumeInfo || {}
    const imageLinks = volumeInfo.imageLinks || {}
    
    return {
      externalId: item.id,
      title: volumeInfo.title || "Unknown Title",
      imageUrl: imageLinks.thumbnail || imageLinks.smallThumbnail || "/M.jpg",
      year: volumeInfo.publishedDate ? volumeInfo.publishedDate.substring(0, 4) : undefined,
      type: "BOOK" as CulturalType,
    }
  })
}

async function searchTMDB(query: string, type: CulturalType): Promise<UnifiedCulturalResult[]> {
  if (!TMDB_API_KEY) {
    console.error("[searchTMDB] TMDB_API_KEY not set")
    return []
  }

  const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`

  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${TMDB_API_KEY}`,
      "Accept": "application/json",
    },
  })

  if (!response.ok) {
    console.error("[searchTMDB] API error:", response.status, response.statusText)
    return []
  }

  const data = await response.json()

  if (!data.results || !Array.isArray(data.results)) {
    return []
  }

  // Filter by type if specified
  const filteredResults = data.results.filter((item: any) => {
    if (type === "MOVIE") {
      return item.media_type === "movie"
    } else if (type === "SERIES") {
      return item.media_type === "tv"
    }
    return item.media_type === "movie" || item.media_type === "tv"
  })

  return filteredResults.map((item: any) => {
    const isMovie = item.media_type === "movie"
    const posterPath = item.poster_path
      ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
      : "/M.jpg"

    return {
      externalId: String(item.id),
      title: item.title || item.name || "Unknown Title",
      imageUrl: posterPath,
      year: isMovie 
        ? (item.release_date ? item.release_date.substring(0, 4) : undefined)
        : (item.first_air_date ? item.first_air_date.substring(0, 4) : undefined),
      type: isMovie ? "MOVIE" : "SERIES",
    }
  })
}
