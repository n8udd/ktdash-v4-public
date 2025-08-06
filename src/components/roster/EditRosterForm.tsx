'use client'

import { Input, Label } from '@/components/ui'
import { commands } from '@uiw/react-md-editor'
import dynamic from 'next/dynamic'
import { forwardRef, useImperativeHandle, useState } from 'react'

// Avoid SSR issues with dynamic import
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export interface EditRosterFormRef {
  handleSubmit: () => void
}

const EditRosterForm = forwardRef(function EditRosterForm(
  {
    initialName,
    initialDescription,
    onSubmit,
  }: {
    initialName: string
    initialDescription: string
    onSubmit: (name: string, description: string | null) => void
    onCancel: () => void
  },
  ref
) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)

  // Add useImperativeHandle to expose handleSubmit
  useImperativeHandle(ref, () => ({
    handleSubmit: () => onSubmit(name, description)
  }))

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[auto_1fr] items-center gap-x-4">
        <Label htmlFor="rosterName">Roster Name</Label>
        <Input
          id="rosterName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter roster name"
        />
      </div>
      <div>
        <Label htmlFor="rosterDescription">Description</Label>
        <div className="custom-md-editor">
          <MDEditor
            id="rosterDescription"
            value={description}
            onChange={(val) => setDescription(val || '')}
            preview="edit"
            data-color-mode="dark"
            style={{ minHeight: 300 }}
            commands={[
              commands.bold,
              commands.italic,
              commands.hr,
              commands.divider,
              commands.quote,
              commands.unorderedListCommand,
              commands.orderedListCommand
            ]}
          />
        </div>
      </div>
    </div>
  )
})

export default EditRosterForm
