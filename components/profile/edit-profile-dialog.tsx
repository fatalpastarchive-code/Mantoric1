'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface EditProfileDialogProps {
  username: string | null
  bio: string | null
  bannerUrl: string | null
  avatar: string | null
  trigger?: React.ReactNode
}

export function EditProfileDialog(props: EditProfileDialogProps) {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState(props.username ?? "")
  const [bio, setBio] = useState(props.bio ?? "")
  const [bannerUrl, setBannerUrl] = useState(props.bannerUrl ?? "")
  const [avatar, setAvatar] = useState(props.avatar ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remaining = 160 - bio.length

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username || undefined,
          bio,
          bannerUrl: bannerUrl || undefined,
          avatar: avatar || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || "Failed to update profile.")
        return
      }

      setOpen(false)
      window.location.reload()
    } catch {
      setError("Unexpected error while updating profile.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {props.trigger || (
          <Button variant="outline" size="sm" className="bg-background/60 backdrop-blur-md border-border/60 hover:bg-background/80">
            Edit Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Username
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_handle"
              maxLength={24}
            />
            <p className="text-[11px] text-muted-foreground">
              3-24 characters. Letters, numbers and underscore only.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Bio
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 160))}
              rows={3}
              placeholder="Share a short summary about yourself (max 160 characters)."
            />
            <p className="text-[11px] text-muted-foreground text-right">
              {remaining} characters left
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Banner URL
            </label>
            <Input
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://images.example.com/banner.jpg"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Avatar URL
            </label>
            <Input
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://images.example.com/avatar.jpg"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive">
              {error}
            </p>
          )}
        </div>
        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

