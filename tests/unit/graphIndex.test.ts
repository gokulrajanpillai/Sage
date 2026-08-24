import { describe, expect, it } from 'vitest'
import { buildGraph, type GraphSourceNote } from '../../src/shared/graph/graphIndex'

function note(partial: Partial<GraphSourceNote> & Pick<GraphSourceNote, 'id' | 'title'>): GraphSourceNote {
  return {
    tags: [],
    wikilinks: { resolved: [], unresolved: [] },
    ...partial
  }
}

describe('buildGraph', () => {
  it('creates one node per note and edges for wikilinks and shared tags', () => {
    const notes: GraphSourceNote[] = [
      note({ id: 'a', title: 'A', tags: ['x'], wikilinks: { resolved: ['B'], unresolved: [] } }),
      note({ id: 'b', title: 'B', tags: ['x'] }),
      note({ id: 'c', title: 'C', tags: ['y'] })
    ]

    const { nodes, edges } = buildGraph(notes)

    expect(nodes).toHaveLength(3)
    expect(edges).toContainEqual({ source: 'a', target: 'b', kind: 'wikilink' })
    expect(edges).toContainEqual({ source: 'a', target: 'b', kind: 'tag' })
    expect(edges.some((edge) => [edge.source, edge.target].includes('c'))).toBe(false)
  })

  it('does not create duplicate edges for the same pair and kind', () => {
    const notes: GraphSourceNote[] = [
      note({ id: 'a', title: 'A', wikilinks: { resolved: ['B'], unresolved: [] } }),
      note({ id: 'b', title: 'B', wikilinks: { resolved: ['A'], unresolved: [] } })
    ]

    const { edges } = buildGraph(notes)
    expect(edges.filter((edge) => edge.kind === 'wikilink')).toHaveLength(1)
  })
})
