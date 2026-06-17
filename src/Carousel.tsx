import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'

type IconKind = 'orbit' | 'bolt' | 'wave' | 'hex' | 'pulse' | 'shield'

type CardData = {
  title: string
  subtitle: string
  color: string
  icon: IconKind
  detail: string
}

const CARDS: CardData[] = [
  { title: 'Neural Core', subtitle: 'AI Engine', color: '#7dd3fc', icon: 'orbit', detail: 'STATUS: ONLINE' },
  { title: 'Quantum Grid', subtitle: 'Compute Mesh', color: '#a78bfa', icon: 'hex', detail: 'NODES: 2,048' },
  { title: 'Holo Stream', subtitle: 'Live Render', color: '#f472b6', icon: 'wave', detail: 'FPS: 240' },
  { title: 'Cipher Vault', subtitle: 'Secure Layer', color: '#34d399', icon: 'shield', detail: 'ENCRYPTED' },
  { title: 'Pulse Net', subtitle: 'Edge Sync', color: '#fbbf24', icon: 'pulse', detail: 'LATENCY: 4ms' },
  { title: 'Void Link', subtitle: 'Deep Channel', color: '#60a5fa', icon: 'bolt', detail: 'BANDWIDTH: 10G' },
]

function createIconTexture(color: string, icon: IconKind): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2
  const cy = size / 2

  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2)
  glow.addColorStop(0, `${color}55`)
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, size, size)

  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  switch (icon) {
    case 'orbit': {
      ctx.beginPath()
      ctx.arc(cx, cy, 60, 0, Math.PI * 2)
      ctx.stroke()
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(Math.PI / 4)
      ctx.scale(1, 0.4)
      ctx.beginPath()
      ctx.arc(0, 0, 90, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
      ctx.beginPath()
      ctx.arc(cx, cy, 14, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'hex': {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 2
        const px = cx + Math.cos(a) * 80
        const py = cy + Math.sin(a) * 80
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(cx, cy, 10, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'wave': {
      ctx.beginPath()
      for (let x = -100; x <= 100; x += 4) {
        const y = Math.sin(x / 18) * 30
        if (x === -100) ctx.moveTo(cx + x, cy + y)
        else ctx.lineTo(cx + x, cy + y)
      }
      ctx.stroke()
      break
    }
    case 'shield': {
      ctx.beginPath()
      ctx.moveTo(cx, cy - 90)
      ctx.lineTo(cx + 70, cy - 60)
      ctx.lineTo(cx + 70, cy + 30)
      ctx.quadraticCurveTo(cx, cy + 100, cx, cy + 100)
      ctx.quadraticCurveTo(cx, cy + 100, cx - 70, cy + 30)
      ctx.lineTo(cx - 70, cy - 60)
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx - 22, cy)
      ctx.lineTo(cx - 5, cy + 20)
      ctx.lineTo(cx + 28, cy - 25)
      ctx.stroke()
      break
    }
    case 'pulse': {
      ctx.beginPath()
      ctx.moveTo(cx - 100, cy)
      ctx.lineTo(cx - 40, cy)
      ctx.lineTo(cx - 20, cy - 50)
      ctx.lineTo(cx, cy + 50)
      ctx.lineTo(cx + 20, cy)
      ctx.lineTo(cx + 100, cy)
      ctx.stroke()
      break
    }
    case 'bolt': {
      ctx.beginPath()
      ctx.moveTo(cx + 18, cy - 90)
      ctx.lineTo(cx - 40, cy + 10)
      ctx.lineTo(cx, cy + 10)
      ctx.lineTo(cx - 18, cy + 90)
      ctx.lineTo(cx + 45, cy - 10)
      ctx.lineTo(cx + 5, cy - 10)
      ctx.closePath()
      ctx.fill()
      break
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

function GlassCard({
  data,
  angle,
  radius,
  rotationRef,
  index,
  active,
  onSelect,
}: {
  data: CardData
  angle: number
  radius: number
  rotationRef: React.RefObject<number>
  index: number
  active: boolean
  onSelect: (i: number) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const iconRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const pulseRef = useRef(0)

  const iconTexture = useMemo(() => createIconTexture(data.color, data.icon), [data.color, data.icon])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const a = angle + (rotationRef.current ?? 0)
    const x = Math.sin(a) * radius
    const z = Math.cos(a) * radius
    groupRef.current.position.x = x
    groupRef.current.position.z = z
    groupRef.current.lookAt(0, groupRef.current.position.y, 0)
    const targetScale = active ? 1.25 : hovered ? 1.1 : 1
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1,
    )

    pulseRef.current = Math.max(0, pulseRef.current - delta * 2)
    if (iconRef.current) {
      const bump = 1 + pulseRef.current * 0.5
      iconRef.current.scale.setScalar(bump)
      iconRef.current.rotation.z += delta * (0.4 + pulseRef.current * 4)
    }
  })

  const handlePress = () => {
    onSelect(index)
    setExpanded((e) => !e)
    pulseRef.current = 1
  }

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.6}>
        <group
          onClick={handlePress}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <RoundedBox args={[1.6, 2.2, 0.06]} radius={0.12} smoothness={6}>
            <meshPhysicalMaterial
              color={data.color}
              transmission={0.85}
              roughness={0.12}
              thickness={0.6}
              ior={1.3}
              reflectivity={0.4}
              clearcoat={1}
              clearcoatRoughness={0.1}
              emissive={data.color}
              emissiveIntensity={active ? 0.35 : 0.12}
              transparent
              opacity={0.55}
            />
          </RoundedBox>
          <mesh ref={iconRef} position={[0, -0.35, 0.05]}>
            <planeGeometry args={[0.9, 0.9]} />
            <meshBasicMaterial map={iconTexture} transparent depthWrite={false} />
          </mesh>
          <Text
            position={[0, 0.55, 0.05]}
            fontSize={0.16}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.004}
            outlineColor="#000814"
          >
            {data.title}
          </Text>
          <Text
            position={[0, 0.25, 0.05]}
            fontSize={0.09}
            color={data.color}
            anchorX="center"
            anchorY="middle"
          >
            {data.subtitle}
          </Text>
          {expanded && (
            <Text
              position={[0, -0.92, 0.05]}
              fontSize={0.08}
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.003}
              outlineColor="#000814"
            >
              {data.detail}
            </Text>
          )}
        </group>
      </Float>
    </group>
  )
}

function Scene({
  activeIndex,
  setActiveIndex,
  targetRotationRef,
  dragging,
}: {
  activeIndex: number
  setActiveIndex: (i: number) => void
  targetRotationRef: React.RefObject<number>
  dragging: boolean
}) {
  const rotationRef = useRef(0)
  const radius = 3.4

  useFrame(() => {
    const target = targetRotationRef.current ?? 0
    const speed = dragging ? 0.4 : 0.08
    rotationRef.current += (target - rotationRef.current) * speed
  })

  const items = useMemo(
    () =>
      CARDS.map((card, i) => ({
        card,
        angle: (i / CARDS.length) * Math.PI * 2,
      })),
    [],
  )

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={45} color="#7dd3fc" />
      <pointLight position={[-5, -3, -5]} intensity={35} color="#f472b6" />
      <pointLight position={[0, 4, -4]} intensity={25} color="#a78bfa" />
      <pointLight position={[0, -3, 4]} intensity={20} color="#ffffff" />
      {items.map(({ card, angle }, i) => (
        <GlassCard
          key={card.title}
          data={card}
          angle={angle}
          radius={radius}
          rotationRef={rotationRef}
          index={i}
          active={i === activeIndex}
          onSelect={setActiveIndex}
        />
      ))}
    </>
  )
}

export default function Carousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  const targetRotationRef = useRef(0)
  const dragStartXRef = useRef(0)
  const dragStartRotationRef = useRef(0)

  const step = (Math.PI * 2) / CARDS.length

  const goTo = (i: number) => {
    const wrapped = (i + CARDS.length) % CARDS.length
    setActiveIndex(wrapped)
    targetRotationRef.current = -wrapped * step
  }

  const snapToNearest = () => {
    const raw = -targetRotationRef.current / step
    const wrapped = ((Math.round(raw) % CARDS.length) + CARDS.length) % CARDS.length
    setActiveIndex(wrapped)
    targetRotationRef.current = -wrapped * step
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true)
    dragStartXRef.current = e.clientX
    dragStartRotationRef.current = targetRotationRef.current
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const dx = e.clientX - dragStartXRef.current
    targetRotationRef.current = dragStartRotationRef.current + dx * 0.01
  }

  const handlePointerUp = () => {
    if (!dragging) return
    setDragging(false)
    snapToNearest()
  }

  return (
    <div className="carousel-wrap">
      <h1 className="carousel-title">3D Tech Carousel</h1>
      <p className="carousel-subtitle">
        Floating glassmorphism cards · тащи мышью, чтобы вращать
      </p>
      <div
        className="canvas-shell"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
      >
        <Canvas camera={{ position: [0, 0.6, 6.5], fov: 45 }}>
          <Scene
            activeIndex={activeIndex}
            setActiveIndex={goTo}
            targetRotationRef={targetRotationRef}
            dragging={dragging}
          />
        </Canvas>
        <div className="glow glow-a" />
        <div className="glow glow-b" />
      </div>
      <div className="controls">
        <button className="nav-btn" onClick={() => goTo(activeIndex - 1)}>
          ‹
        </button>
        <div className="dots">
          {CARDS.map((c, i) => (
            <button
              key={c.title}
              className={`dot ${i === activeIndex ? 'dot-active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={c.title}
            />
          ))}
        </div>
        <button className="nav-btn" onClick={() => goTo(activeIndex + 1)}>
          ›
        </button>
      </div>
    </div>
  )
}
