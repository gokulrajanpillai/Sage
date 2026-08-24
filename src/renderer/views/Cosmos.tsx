import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum
} from 'd3-force'
import { useEffect, useRef, useState, type MouseEvent, type WheelEvent } from 'react'
import { StarField } from '../components/StarField'
import { buildGraph, type GraphEdgeKind, type GraphNode } from '../../shared/graph/graphIndex'
import { useAppStore } from '../store/appStore'
import { useVaultStore } from '../store/vaultStore'
import { colors } from '../theme/tokens'

interface SimNode extends GraphNode, SimulationNodeDatum {}
interface SimLink extends SimulationLinkDatum<SimNode> {
  kind: GraphEdgeKind
}

const SETTLE_TICKS = 60
const MIN_ZOOM = 0.3
const MAX_ZOOM = 3
const NODE_RADIUS = 5

export function Cosmos() {
  const notes = useVaultStore((s) => s.notes)
  const refreshVault = useVaultStore((s) => s.refresh)
  const selectNote = useVaultStore((s) => s.selectNote)
  const setActiveView = useAppStore((s) => s.setActiveView)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const linksRef = useRef<SimLink[]>([])
  const dragOrigin = useRef<{ x: number; y: number } | null>(null)

  const [ready, setReady] = useState(false)
  const [simNodes, setSimNodes] = useState<SimNode[]>([])
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 })
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    void refreshVault()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (notes.length === 0) {
      linksRef.current = []
      setSimNodes([])
      setReady(true)
      return
    }

    const { nodes, edges } = buildGraph(notes)
    const localNodes: SimNode[] = nodes.map((node) => ({ ...node }))
    const localLinks: SimLink[] = edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      kind: edge.kind
    }))

    const simulation = forceSimulation(localNodes)
      .force(
        'link',
        forceLink<SimNode, SimLink>(localLinks)
          .id((node) => node.id)
          .distance(40)
          .strength(0.3)
      )
      .force('charge', forceManyBody().strength(-30))
      .force('center', forceCenter(0, 0))
      .force('collide', forceCollide(NODE_RADIUS + 2))
      .stop()

    for (let i = 0; i < SETTLE_TICKS; i += 1) simulation.tick()

    linksRef.current = localLinks
    setSimNodes([...localNodes])
    setReady(true)
  }, [notes])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !ready) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas.getBoundingClientRect()
    canvas.width = width
    canvas.height = height

    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(width / 2 + transform.x, height / 2 + transform.y)
    ctx.scale(transform.k, transform.k)

    ctx.strokeStyle = colors.border
    ctx.lineWidth = 1 / transform.k
    for (const link of linksRef.current) {
      const sourceId = typeof link.source === 'object' ? (link.source as SimNode).id : link.source
      const targetId = typeof link.target === 'object' ? (link.target as SimNode).id : link.target
      const source = simNodes.find((node) => node.id === sourceId)
      const target = simNodes.find((node) => node.id === targetId)
      if (!source || !target || source.x == null || target.x == null) continue
      ctx.beginPath()
      ctx.moveTo(source.x, source.y ?? 0)
      ctx.lineTo(target.x, target.y ?? 0)
      ctx.stroke()
    }

    for (const node of simNodes) {
      if (node.x == null || node.y == null) continue
      ctx.beginPath()
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = node.id === hoveredId ? colors.accentAmber : colors.accentCyan
      ctx.fill()
    }

    ctx.restore()
  }, [simNodes, transform, hoveredId, ready])

  const toScreen = (node: SimNode) => {
    const canvas = canvasRef.current
    if (!canvas || node.x == null || node.y == null) return null
    const rect = canvas.getBoundingClientRect()
    return {
      left: rect.width / 2 + transform.x + node.x * transform.k,
      top: rect.height / 2 + transform.y + node.y * transform.k
    }
  }

  const handleWheel = (event: WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    setTransform((t) => ({
      ...t,
      k: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, t.k * (event.deltaY < 0 ? 1.1 : 0.9)))
    }))
  }

  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    dragOrigin.current = { x: event.clientX, y: event.clientY }
  }

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!dragOrigin.current) return
    const dx = event.clientX - dragOrigin.current.x
    const dy = event.clientY - dragOrigin.current.y
    dragOrigin.current = { x: event.clientX, y: event.clientY }
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }))
  }

  const handleMouseUp = () => {
    dragOrigin.current = null
  }

  const handleOpen = (id: string) => {
    selectNote(id)
    setActiveView('vault')
  }

  const hoveredNode = simNodes.find((node) => node.id === hoveredId) ?? null
  const hoveredPos = hoveredNode ? toScreen(hoveredNode) : null

  return (
    <div className="relative h-full w-full overflow-hidden" data-testid="cosmos-view">
      <StarField />

      <div className="absolute left-4 top-4 z-10 text-xs" style={{ color: colors.textMuted }}>
        <span data-testid="cosmos-node-count">{simNodes.length} nodes</span>
        {' · '}
        <span data-testid="cosmos-zoom-level">{Math.round(transform.k * 100)}%</span>
      </div>

      <canvas
        ref={canvasRef}
        data-testid="cosmos-canvas"
        className="absolute inset-0 h-full w-full"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {ready &&
        simNodes.map((node) => {
          const pos = toScreen(node)
          if (!pos) return null
          return (
            <button
              key={node.id}
              type="button"
              data-testid={`cosmos-node-${node.id}`}
              aria-label={node.title}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId((current) => (current === node.id ? null : current))}
              onClick={() => handleOpen(node.id)}
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
              style={{ left: pos.left, top: pos.top }}
            />
          )
        })}

      {hoveredNode && hoveredPos && (
        <div
          data-testid="cosmos-hover-label"
          className="pointer-events-none absolute z-10 rounded px-2 py-1 text-xs"
          style={{
            left: hoveredPos.left + 10,
            top: hoveredPos.top + 10,
            backgroundColor: colors.bgRaised,
            color: colors.textPrimary
          }}
        >
          {hoveredNode.title}
        </div>
      )}
    </div>
  )
}
