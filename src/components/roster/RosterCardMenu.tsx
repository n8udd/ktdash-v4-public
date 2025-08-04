import { GAME } from '@/lib/config/game_config'
import { showInfoModal } from '@/lib/utils/showInfoModal'
import { RosterPlain } from '@/types'
import { MenuItem, MenuItems } from '@headlessui/react'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { FiChevronDown, FiChevronsDown, FiChevronsUp, FiChevronUp, FiCopy, FiEdit, FiShare2, FiTrash } from 'react-icons/fi'
import { toast } from 'sonner'

export default function RosterCardMenu({
  roster,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveFirst,
  onMoveDown,
  onMoveLast
}: {
  roster: RosterPlain
  onEdit?: () => void
  onDelete?: () => void
  onMoveUp?: () => void
  onMoveFirst?: () => void
  onMoveDown?: () => void
  onMoveLast?: () => void
}) {

  const router = useRouter()

  const onClone = async () => {
    try {
      const res = await fetch(`/api/rosters/${roster.rosterId}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      if (!res.ok) throw new Error('Failed to create roster')

      const newRosterId = (await res.json()).rosterId
      toast.success('Roster cloned, redirecting...')
      setTimeout(() => router.push(`/rosters/${newRosterId}`), 500)
    } catch (err) {
      console.error(err)
      toast.success('Failed to clone Roster')
    }
  }

  return (
    <MenuItems className="absolute right-0 top-6 m-1 z-50 w-28 origin-top-right rounded-md bg-card border border-border shadow-md focus:outline-none divide-y divide-border">
      <div className="flex flex-col py-1">
        <MenuItem>
          {({ focus }) => (
            <button className={clsx('m-1 text-left text-sm w-full flex items-center gap-2', focus ? 'text-main' : 'text-foreground')}
              onClick={onEdit}
            >
              <FiEdit /> Edit
            </button>
          )}
        </MenuItem>
        <MenuItem>
          {({ focus }) => (
            <button className={clsx('m-1 text-left text-sm w-full flex items-center gap-2', focus ? 'text-main' : 'text-foreground')}
              onClick={onClone}
            >
              <FiCopy /> Clone
            </button>
          )}
        </MenuItem>
        <MenuItem>
          {({ focus }) => (
            <button className={clsx('m-1 text-left text-sm w-full flex items-center gap-2', focus ? 'text-main' : 'text-foreground')}
            onClick={() => {
              showInfoModal({
                title: `Share - ${roster.rosterName}`,
                body:
                <>
                  <strong>RosterID:</strong> <pre className="text-2xl">{roster.rosterId}</pre>
                  <br/>
                  <strong>Roster Link:</strong> <Link href={`/rosters/${roster.rosterId}`}>{GAME.ROOT_URL}/rosters/{roster.rosterId}</Link>
                  <br/><br/>
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded">
                      <QRCodeSVG value={`${GAME.ROOT_URL}/rosters/{roster.rosterId}`} size={128} />
                    </div>
                  </div>
                </>
              })
            }}
            >
              <FiShare2 /> Share
            </button>
          )}
        </MenuItem>
        <MenuItem>
          {({ focus }) => (
            <button className={clsx('m-1 text-left text-sm w-full flex items-center gap-2', focus ? 'text-main' : 'text-foreground')}
              onClick={onMoveUp}
            >
              <FiChevronUp /> Move Up
            </button>
          )}
        </MenuItem>
        <MenuItem>
          {({ focus }) => (
            <button className={clsx('m-1 text-left text-sm w-full flex items-center gap-2', focus ? 'text-main' : 'text-foreground')}
              onClick={onMoveFirst}
            >
              <FiChevronsUp /> Move First
            </button>
          )}
        </MenuItem>
        <MenuItem>
          {({ focus }) => (
            <button className={clsx('m-1 text-left text-sm w-full flex items-center gap-2', focus ? 'text-main' : 'text-foreground')}
              onClick={onMoveDown}
            >
              <FiChevronDown /> Move Down
            </button>
          )}
        </MenuItem>
        <MenuItem>
          {({ focus }) => (
            <button className={clsx('m-1 text-left text-sm w-full flex items-center gap-2', focus ? 'text-main' : 'text-foreground')}
              onClick={onMoveLast}
            >
              <FiChevronsDown /> Move Last
            </button>
          )}
        </MenuItem>
        <MenuItem>
          {({ focus }) => (
            <button className={clsx('m-1 text-left text-sm w-full flex items-center gap-2', focus ? 'text-main' : 'text-foreground')}
              onClick={onDelete}
            >
              <FiTrash /> Delete
            </button>
          )}
        </MenuItem>
      </div>
    </MenuItems>
  )
}
