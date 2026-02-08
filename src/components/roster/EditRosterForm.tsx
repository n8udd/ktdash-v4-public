'use client'

import { Button, Input, Label, Modal } from '@/components/ui'
import { RosterPlain } from '@/types'
import { commands } from '@uiw/react-md-editor'
import dynamic from 'next/dynamic'
import { forwardRef, useImperativeHandle, useState } from 'react'
import { toast } from 'sonner'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })
const MAX_PORTRAIT_BYTES = 10 * 1024 * 1024 // 10MB

export interface EditRosterFormRef {
  handleSubmit: () => void
}

const EditRosterForm = forwardRef(function EditRosterForm(
  {
    roster,
    initialName,
    initialDescription,
    rosterId,
    hasCustomPortrait,
    onSave: onSubmit,
    onCancel,
  }: {
    roster: RosterPlain,
    initialName: string
    initialDescription: string
    rosterId: string
    hasCustomPortrait: boolean
    onSave: (name: string, description: string | null) => void
    onCancel: () => void
  },
  ref
) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)

  const [activeTab, setActiveTab] = useState<'details' | 'portrait'>('details')

  const [portraitFile, setPortraitFile] = useState<File | null>(null)
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [showDeleteConfirmPortrait, setShowDeletePortraitConfirm] = useState(false)

  useImperativeHandle(ref, () => ({
    handleSubmit: async () => {
      if (activeTab === 'details') {
        onSubmit(name, description)
      } else if (activeTab === 'portrait') {
        await handlePortraitSave()
      }
    }
  }))

  const handlePortraitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setUploadError(null)
    if (file && file.size > MAX_PORTRAIT_BYTES) {
      setPortraitFile(null)
      setPortraitPreview(null)
      setUploadError('File too large. Max size is 10MB.')
      return
    }
    setPortraitFile(file)
    if (file) {
      setPortraitPreview(URL.createObjectURL(file))
    }
  }

  const handlePortraitSave = async () => {
    setIsSaving(true)
    setUploadError(null)

    try {
      if (portraitFile) {
        if (portraitFile.size > MAX_PORTRAIT_BYTES) {
          throw new Error('File too large. Max size is 10MB.')
        }
        const formData = new FormData()
        formData.append('type', 'roster')
        formData.append('rosterId', rosterId)
        formData.append('image', portraitFile)

        const res = await fetch(`/api/rosters/${rosterId}/portrait`, {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Upload failed')
        }

        toast.success('Portrait uploaded!')
        setPortraitFile(null)
        setPortraitPreview(null)

        roster.hasCustomPortrait = true
        roster.portraitUpdatedAt = new Date() // Update timestamp
        
        onCancel() // close modal
      }
    } catch (err: any) {
      setUploadError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmDeletePortrait = async () => {
    setShowDeletePortraitConfirm(false)
    setIsSaving(true)
    try {
      const res = await fetch(`/api/rosters/${rosterId}/portrait`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Delete failed')
      }

      toast.success('Portrait deleted.')

      roster.hasCustomPortrait = false
      roster.portraitUpdatedAt = new Date() // Update timestamp

      onCancel() // close modal
    } catch (err: any) {
      setUploadError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-2">
        <button
          className={`px-4 py-2 font-bold ${activeTab === 'details' ? 'border-b-2 border-main text-main' : 'text-muted'}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button
          className={`px-4 py-2 font-bold ${activeTab === 'portrait' ? 'border-b-2 border-main text-main' : 'text-muted'}`}
          onClick={() => setActiveTab('portrait')}
        >
          Portrait
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
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
      )}

      {activeTab === 'portrait' && (
        <div className="flex flex-col space-y-4">
          <div>
            <h5>New Portrait</h5>
            <p className="text-muted mb-2">
              Upload a portrait image for this operative.
              Images will be resized to 900x600 pixels.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handlePortraitChange}
              className="mt-2"
            />
          </div>

          {portraitPreview && (
            <img
              src={portraitPreview}
              alt="Portrait Preview"
              className="rounded border border-border max-w-xs max-h-48 object-cover"
            />
          )}

          {uploadError && <p className="text-red-500">{uploadError}</p>}

          {hasCustomPortrait && (
            <>
              <hr className="my-4" />
              <div className="flex justify-between items-center">
                <h5>Delete Portrait</h5>
                <Button onClick={() => setShowDeletePortraitConfirm(true)}>
                  <h6>Delete</h6>
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmPortrait && (
        <Modal
          title="Delete Portrait"
          onClose={() => setShowDeletePortraitConfirm(false)}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowDeletePortraitConfirm(false)}>
                <h6>Cancel</h6>
              </Button>
              <Button onClick={handleConfirmDeletePortrait}>
                <h6>Delete</h6>
              </Button>
            </div>
          }
        >
          Are you sure you want to delete this roster’s portrait? This action cannot be undone.
        </Modal>
      )}
    </>
  )
})

export default EditRosterForm
