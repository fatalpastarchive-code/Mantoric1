"use client"

import { Trash2 } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { CAESAR_CLERK_ID } from "@/lib/constants"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function DeleteButton({ articleId }: { articleId: string }) {
  const { user } = useUser()
  const router = useRouter()

  if (!user || user.id !== CAESAR_CLERK_ID) {
    return null
  }

  const handleDelete = () => {
    toast("Are you sure you want to securely delete this article?", {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            const res = await fetch(`/api/articles/${articleId}`, { method: "DELETE" })
            if (res.ok) {
              toast.success("Article deleted.")
              router.push("/")
            } else {
              toast.error("Failed to delete article.")
            }
          } catch (error) {
            toast.error("An error occurred.")
          }
        }
      },
    })
  }

  return (
    <button
      onClick={handleDelete}
      className="flex items-center justify-center p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
      title="Secure Delete"
    >
      <Trash2 className="h-5 w-5" />
    </button>
  )
}
