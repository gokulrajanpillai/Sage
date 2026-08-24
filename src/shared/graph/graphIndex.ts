export interface GraphSourceNote {
  id: string
  title: string
  tags: string[]
  wikilinks: {
    resolved: string[]
    unresolved: string[]
  }
}

export interface GraphNode {
  id: string
  title: string
  tags: string[]
}

export type GraphEdgeKind = 'wikilink' | 'tag'

export interface GraphEdge {
  source: string
  target: string
  kind: GraphEdgeKind
}

export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export function buildGraph(notes: GraphSourceNote[]): Graph {
  const nodes: GraphNode[] = notes.map((note) => ({ id: note.id, title: note.title, tags: note.tags }))
  const titleToId = new Map(notes.map((note) => [note.title, note.id]))
  const edges: GraphEdge[] = []
  const seen = new Set<string>()

  const addEdge = (a: string, b: string, kind: GraphEdgeKind) => {
    if (a === b) return
    const key = [a, b].sort().join('::') + `::${kind}`
    if (seen.has(key)) return
    seen.add(key)
    edges.push({ source: a, target: b, kind })
  }

  for (const note of notes) {
    for (const target of note.wikilinks.resolved) {
      const targetId = titleToId.get(target)
      if (targetId) addEdge(note.id, targetId, 'wikilink')
    }
  }

  for (let i = 0; i < notes.length; i += 1) {
    for (let j = i + 1; j < notes.length; j += 1) {
      if (notes[i].tags.some((tag) => notes[j].tags.includes(tag))) {
        addEdge(notes[i].id, notes[j].id, 'tag')
      }
    }
  }

  return { nodes, edges }
}
