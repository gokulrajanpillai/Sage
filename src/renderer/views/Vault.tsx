import { marked } from 'marked'
import { useEffect, useMemo } from 'react'
import { useVaultStore } from '../store/vaultStore'
import { borders, colors } from '../theme/tokens'

export function Vault() {
  const notes = useVaultStore((s) => s.notes)
  const backlinks = useVaultStore((s) => s.backlinks)
  const selectedNoteId = useVaultStore((s) => s.selectedNoteId)
  const tagFilter = useVaultStore((s) => s.tagFilter)
  const refresh = useVaultStore((s) => s.refresh)
  const selectNote = useVaultStore((s) => s.selectNote)
  const setTagFilter = useVaultStore((s) => s.setTagFilter)

  useEffect(() => {
    void refresh()
    const unsubscribe = window.sage.vault.onChanged(() => void refresh())
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    notes.forEach((note) => note.tags.forEach((tag) => tagSet.add(tag)))
    return Array.from(tagSet).sort()
  }, [notes])

  const visibleNotes = tagFilter ? notes.filter((note) => note.tags.includes(tagFilter)) : notes
  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? null
  const noteBacklinks = selectedNote ? (backlinks[selectedNote.title] ?? []) : []
  const previewHtml = selectedNote ? (marked.parse(selectedNote.body) as string) : ''

  const filterButtonStyle = (active: boolean) => ({
    backgroundColor: active ? colors.accentCyan : colors.bgRaised,
    color: active ? colors.bg : colors.textMuted
  })

  return (
    <div className="flex h-full" data-testid="vault-view">
      <aside
        className="w-56 shrink-0 overflow-auto p-4"
        style={{ borderRight: `${borders.hairlineWidth}px solid ${colors.border}` }}
        data-testid="vault-file-tree"
      >
        <h2 className="mb-3 text-sm uppercase tracking-widest" style={{ color: colors.textMuted }}>
          Vault
        </h2>

        <div className="mb-3 flex flex-wrap gap-1" data-testid="vault-tag-filter">
          <button
            type="button"
            onClick={() => setTagFilter(null)}
            className="rounded px-2 py-0.5 text-xs"
            style={filterButtonStyle(tagFilter === null)}
          >
            all
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              data-testid={`vault-tag-${tag}`}
              onClick={() => setTagFilter(tag)}
              className="rounded px-2 py-0.5 text-xs"
              style={filterButtonStyle(tagFilter === tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        <ul>
          {visibleNotes.map((note) => (
            <li key={note.id}>
              <button
                type="button"
                data-testid={`vault-note-${note.id}`}
                onClick={() => selectNote(note.id)}
                className="w-full truncate rounded px-2 py-1 text-left text-sm"
                style={{
                  backgroundColor: selectedNoteId === note.id ? colors.bgRaised : 'transparent',
                  color: colors.textPrimary
                }}
              >
                {note.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 overflow-auto p-6">
        {selectedNote ? (
          <>
            <div data-testid="vault-preview" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            <div className="mt-6" data-testid="vault-backlinks">
              <h3 className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>
                Backlinks
              </h3>
              {noteBacklinks.length === 0 ? (
                <p className="text-sm" style={{ color: colors.textMuted }}>
                  No backlinks yet.
                </p>
              ) : (
                <ul>
                  {noteBacklinks.map((title) => (
                    <li key={title} className="text-sm" style={{ color: colors.accentAmber }}>
                      {title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm" style={{ color: colors.textMuted }}>
            No notes yet.
          </p>
        )}
      </main>
    </div>
  )
}
