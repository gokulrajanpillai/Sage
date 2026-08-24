import { useMemo } from 'react'
import { colors } from '../theme/tokens'

interface StarFieldProps {
  count?: number
}

const DEFAULT_STAR_COUNT = 120

export function StarField({ count = DEFAULT_STAR_COUNT }: StarFieldProps) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: Math.random() * 1.2 + 0.2,
        opacity: Math.random() * 0.6 + 0.2
      })),
    [count]
  )

  return (
    <svg aria-hidden="true" data-testid="star-field" className="pointer-events-none absolute inset-0 h-full w-full">
      {stars.map((star, i) => (
        <circle key={i} cx={`${star.x}%`} cy={`${star.y}%`} r={star.r} fill={colors.textPrimary} opacity={star.opacity} />
      ))}
    </svg>
  )
}
