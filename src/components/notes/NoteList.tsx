import type { Note } from '../../lib/types'

function formatStamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function NoteList({ notes, onRemove }: { notes: Note[]; onRemove: (id: string) => void }) {
  if (notes.length === 0) {
    return <p className="py-4 text-[15px] text-[var(--muted)]">No notes yet.</p>
  }
  return (
    <ul className="mt-4 list-none p-0">
      {notes.map((note) => (
        <li key={note.id} className="border-b border-[var(--line)] py-3">
          <p className="whitespace-pre-wrap text-[15px]">{note.body}</p>
          <div className="mt-1 flex items-center gap-3 text-[13px] text-[var(--faint)]">
            <span>{formatStamp(note.created_at)}</span>
            <button onClick={() => onRemove(note.id)} className="underline">
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
