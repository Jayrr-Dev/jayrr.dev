"use client"

import * as React from "react"

function ImageUpload({ disabled = false }: { disabled?: boolean }) {
  const [name, setName] = React.useState("")

  return (
    <label data-slot="image-upload" className="flex w-full flex-col gap-1 text-xs">
      <span className="font-medium">Image</span>
      <input
        type="file"
        accept="image/*"
        disabled={disabled}
        className="text-xs"
        onChange={(event) => {
          const file = event.target.files?.[0]
          setName(file ? file.name : "")
        }}
      />
      {name ? <span className="text-muted-foreground">{name}</span> : null}
    </label>
  )
}

export { ImageUpload }
