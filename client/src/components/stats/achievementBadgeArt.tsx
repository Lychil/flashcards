import type { ReactNode } from 'react'

interface BadgeArtProps {
  muted?: boolean
  className?: string
}

function BadgeSvg({ muted, className = '', children }: BadgeArtProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={['h-full w-full', muted ? 'opacity-55' : '', className].filter(Boolean).join(' ')}
      aria-hidden
    >
      {children}
    </svg>
  )
}

export function CoffeeMonkeyBadge({ muted, className }: BadgeArtProps) {
  return (
    <BadgeSvg muted={muted} className={className}>
      <ellipse cx="40" cy="58" rx="22" ry="8" fill="#F5DEB3" opacity="0.45" />
      <path
        d="M24 34c0-8 7-14 16-14s16 6 16 14v8c0 6-5 10-11 10H35c-6 0-11-4-11-10v-8z"
        fill="#A67C52"
      />
      <circle cx="32" cy="36" r="3" fill="#3D2914" />
      <circle cx="48" cy="36" r="3" fill="#3D2914" />
      <circle cx="33" cy="35" r="1" fill="#fff" />
      <circle cx="49" cy="35" r="1" fill="#fff" />
      <path d="M36 44q4 4 8 0" stroke="#3D2914" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="49" y="46" width="16" height="18" rx="4" fill="#E879A9" />
      <rect x="51" y="48" width="12" height="4" rx="2" fill="#FFD6E7" />
      <path d="M52 42h10v4h-10z" fill="#fff" opacity="0.8" />
      <path
        d="M18 30c-4-2-4-8 0-10M62 30c4-2 4-8 0-10"
        stroke="#A67C52"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </BadgeSvg>
  )
}

export function BoneMonkeyBadge({ muted, className }: BadgeArtProps) {
  return (
    <BadgeSvg muted={muted} className={className}>
      <path
        d="M28 22c-6 0-10 4-10 9s4 9 10 9c2 0 4-.5 5.5-1.5C35 42 37 44 40 44s5-2 6.5-4.5C48 40 50 41 52 41c6 0 10-4 10-9s-4-9-10-9c-2 0-4 .5-5.5 1.5C45 18 43 16 40 16s-5 2-6.5 4.5C32 20 30 19 28 22z"
        fill="#F8FAFC"
        stroke="#6366f1"
        strokeWidth="2"
      />
      <circle cx="34" cy="30" r="2.5" fill="#6366f1" />
      <circle cx="46" cy="30" r="2.5" fill="#6366f1" />
      <path d="M18 52h44M22 58h36" stroke="#A67C52" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="40" cy="62" rx="14" ry="5" fill="#A67C52" opacity="0.35" />
    </BadgeSvg>
  )
}

export function CalendarMonkeyBadge({ muted, className }: BadgeArtProps) {
  return (
    <BadgeSvg muted={muted} className={className}>
      <rect x="18" y="24" width="44" height="36" rx="6" fill="#fff" stroke="#16A34A" strokeWidth="2" />
      <path d="M18 32h44" stroke="#16A34A" strokeWidth="2" />
      <rect x="26" y="18" width="4" height="10" rx="2" fill="#16A34A" />
      <rect x="50" y="18" width="4" height="10" rx="2" fill="#16A34A" />
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={26 + col * 12}
            y={38 + row * 8}
            width="8"
            height="6"
            rx="1.5"
            fill={row === 0 && col === 1 ? '#16A34A' : '#DCFCE7'}
          />
        )),
      )}
      <circle cx="58" cy="54" r="12" fill="#A67C52" />
      <circle cx="55" cy="52" r="1.5" fill="#3D2914" />
      <circle cx="61" cy="52" r="1.5" fill="#3D2914" />
      <path d="M56 56q2 2 4 0" stroke="#3D2914" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </BadgeSvg>
  )
}

export function TrophyMonkeyBadge({ muted, className }: BadgeArtProps) {
  return (
    <BadgeSvg muted={muted} className={className}>
      <path d="M28 58V44c0-8 5-14 12-14s12 6 12 14v14" fill="#A67C52" />
      <circle cx="40" cy="34" r="12" fill="#A67C52" />
      <circle cx="36" cy="32" r="2" fill="#3D2914" />
      <circle cx="44" cy="32" r="2" fill="#3D2914" />
      <path
        d="M24 30h-6c0 6 3 10 8 12M56 30h6c0 6-3 10-8 12"
        stroke="#F5B84C"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M32 18h16l-2 8H34l-2-8z" fill="#F5B84C" />
      <rect x="34" y="58" width="12" height="4" rx="1" fill="#F5B84C" />
    </BadgeSvg>
  )
}

export function NightMonkeyBadge({ muted, className }: BadgeArtProps) {
  return (
    <BadgeSvg muted={muted} className={className}>
      <circle cx="58" cy="22" r="10" fill="#FDE68A" />
      <circle cx="55" cy="20" r="8" fill="#312E81" />
      {[20, 28, 36].map((y, i) => (
        <circle key={y} cx={18 + i * 4} cy={y} r="1.2" fill="#fff" opacity="0.8" />
      ))}
      <circle cx="36" cy="48" r="14" fill="#A67C52" />
      <circle cx="31" cy="46" r="2" fill="#3D2914" />
      <circle cx="41" cy="46" r="2" fill="#3D2914" />
      <path d="M33 52q3 3 6 0" stroke="#3D2914" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <text x="40" y="68" textAnchor="middle" fill="#C7D2FE" fontSize="8" fontWeight="600">
        03:00
      </text>
    </BadgeSvg>
  )
}

export function GhostMonkeyBadge({ muted, className }: BadgeArtProps) {
  return (
    <BadgeSvg muted={muted} className={className}>
      <path
        d="M40 18c-12 0-20 10-20 22v18c0 2 1 4 3 4h6l3 6 3-6h5c2 0 3-2 3-4V40c0-12-8-22-20-22z"
        fill="#E2E8F0"
        stroke="#94A3B8"
        strokeWidth="2"
      />
      <circle cx="33" cy="38" r="3" fill="#64748B" />
      <circle cx="47" cy="38" r="3" fill="#64748B" />
      <path d="M36 48h8" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="28" r="8" fill="#A67C52" opacity="0.85" />
      <circle cx="37" cy="27" r="1.5" fill="#3D2914" />
      <circle cx="43" cy="27" r="1.5" fill="#3D2914" />
    </BadgeSvg>
  )
}
