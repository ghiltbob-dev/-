import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
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
  { title: 'Neural Core', subtitle: 'AI Engine', color: '#ff2bd6', icon: 'orbit', detail: 'STATUS: ONLINE' },
  { title: 'Quantum Grid', subtitle: 'Compute Mesh', color: '#00f6ff', icon: 'hex', detail: 'NODES: 2,048' },
  { title: 'Holo Stream', subtitle: 'Live Render', color: '#ffb000', icon: 'wave', detail: 'FPS: 240' },
  { title: 'Cipher Vault', subtitle: 'Secure Layer', color: '#7cff6b', icon: 'shield', detail: 'ENCRYPTED' },
  { title: 'Pulse Net', subtitle: 'Edge Sync', color: '#ff2bd6', icon: 'pulse', detail: 'LATENCY: 4ms' },
  { title: 'Void Link', subtitle: 'Deep Channel', color: '#00f6ff', icon: 'bolt', detail: 'BANDWIDTH: 10G' },
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

function SynthGrid() {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const lines = useMemo(() => {
    const group: { points: THREE.Vector3[] }[] = []
    const size = 30
    const step = 1
    for (let x = -size; x <= size; x += step) {
      group.push({ points: [new THREE.Vector3(x, 0, -size), new THREE.Vector3(x, 0, size)] })
    }
    for (let z = -size; z <= size; z += step) {
      group.push({ points: [new THREE.Vector3(-size, 0, z), new THREE.Vector3(size, 0, z)] })
    }
    return group
  }, [])

  useFrame((state) => {
    if (matRef.current) matRef.current.opacity = 0.35 + Math.sin(state.clock.elapsedTime * 0.6) * 0.05
  })

  return (
    <group position={[0, -1.6, 0]}>
      {lines.map((l, i) => (
        <line key={i}>
          <bufferGeometry
            attach="geometry"
            onUpdate={(geo) => geo.setFromPoints(l.points)}
          />
          <lineBasicMaterial ref={i === 0 ? matRef : undefined} attach="material" color="#ff2bd6" transparent opacity={0.35} />
        </line>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial color="#05010a" transparent opacity={0.55} />
      </mesh>
    </group>
  )
}

function SunHorizon() {
  return (
    <group position={[0, -0.4, -9]}>
      <mesh>
        <circleGeometry args={[3.2, 64]} />
        <meshBasicMaterial color="#ff7a18" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[3.2, 3.4, 64]} />
        <meshBasicMaterial color="#ffe27a" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

function wrappedDelta(value: number, total: number) {
  let d = value
  d -= total * Math.round(d / total)
  return d
}

function ChromeCard({
  data,
  index,
  total,
  continuousIndexRef,
  active,
  onSelect,
}: {
  data: CardData
  index: number
  total: number
  continuousIndexRef: React.RefObject<number>
  active: boolean
  onSelect: (i: number) => void
}) {
  const pivotRef = useRef<THREE.Group>(null)
  const groupRef = useRef<THREE.Group>(null)
  const iconRef = useRef<THREE.Mesh>(null)
  const cardMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const edgeMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const [hovered, setHovered] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const pulseRef = useRef(0)

  const iconTexture = useMemo(() => createIconTexture(data.color, data.icon), [data.color, data.icon])
  const radius = 3.4
  const angleStep = (Math.PI * 2) / total

  useFrame((_, delta) => {
    if (!pivotRef.current || !groupRef.current) return
    const continuous = continuousIndexRef.current ?? 0
    const angle = (index - continuous) * angleStep
    const rel = wrappedDelta(index - continuous, total)
    const absRel = Math.abs(rel)

    const x = Math.sin(angle) * radius
    const z = Math.cos(angle) * radius - radius
    const facing = -angle

    pivotRef.current.position.x = THREE.MathUtils.lerp(pivotRef.current.position.x, x, 0.18)
    pivotRef.current.position.z = THREE.MathUtils.lerp(pivotRef.current.position.z, z, 0.18)
    pivotRef.current.rotation.y = THREE.MathUtils.lerp(pivotRef.current.rotation.y, facing, 0.18)

    const scale = Math.max(0.4, 1 - absRel * 0.22) * (hovered && absRel < 0.5 ? 1.06 : 1)
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, scale, 0.18))

    const depthFade = Math.max(0.15, 1 - absRel * 0.32)
    if (cardMatRef.current) {
      cardMatRef.current.opacity = THREE.MathUtils.lerp(cardMatRef.current.opacity, depthFade, 0.15)
      cardMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        cardMatRef.current.emissiveIntensity,
        active ? 0.9 : 0.25,
        0.15,
      )
    }
    if (edgeMatRef.current) {
      edgeMatRef.current.opacity = THREE.MathUtils.lerp(
        edgeMatRef.current.opacity,
        active ? 1 : Math.max(0.2, 0.55 - absRel * 0.1),
        0.15,
      )
    }

    pulseRef.current = Math.max(0, pulseRef.current - delta * 2)
    if (iconRef.current) {
      const bump = 1 + pulseRef.current * 0.5
      iconRef.current.scale.setScalar(bump)
      iconRef.current.rotation.z += delta * (0.2 + pulseRef.current * 4)
    }
  })

  const handlePress = () => {
    onSelect(index)
    setExpanded((e) => !e)
    pulseRef.current = 1
  }

  return (
    <group ref={pivotRef}>
      <group
        ref={groupRef}
        onClick={handlePress}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <mesh>
          <boxGeometry args={[1.6, 2.2, 0.08]} />
          <meshStandardMaterial
            ref={cardMatRef}
            color="#0c0c14"
            metalness={0.95}
            roughness={0.18}
            emissive={data.color}
            emissiveIntensity={0.25}
            transparent
            opacity={1}
          />
        </mesh>
        <lineSegments position={[0, 0, 0.045]}>
          <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(1.6, 2.2, 0.08)]} />
          <lineBasicMaterial ref={edgeMatRef} color={data.color} transparent opacity={0.55} linewidth={2} />
        </lineSegments>
        <mesh ref={iconRef} position={[0, 0.55, 0.06]}>
          <planeGeometry args={[0.9, 0.9]} />
          <meshBasicMaterial map={iconTexture} transparent depthWrite={false} />
        </mesh>
        <Text
          position={[0, -0.1, 0.06]}
          fontSize={0.16}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.004}
          outlineColor="#000000"
          font={undefined}
        >
          {data.title}
        </Text>
        <Text
          position={[0, -0.4, 0.06]}
          fontSize={0.1}
          color={data.color}
          anchorX="center"
          anchorY="middle"
        >
          {data.subtitle}
        </Text>
        {expanded && (
          <Text
            position={[0, -0.9, 0.06]}
            fontSize={0.08}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.003}
            outlineColor="#000000"
          >
            {data.detail}
          </Text>
        )}
      </group>
    </group>
  )
}

function Scene({
  activeIndex,
  setActiveIndex,
  targetIndexRef,
  dragging,
}: {
  activeIndex: number
  setActiveIndex: (i: number) => void
  targetIndexRef: React.RefObject<number>
  dragging: boolean
}) {
  const continuousIndexRef = useRef(0)

  useFrame(() => {
    const target = targetIndexRef.current ?? 0
    const speed = dragging ? 0.45 : 0.12
    continuousIndexRef.current += wrappedDelta(target - continuousIndexRef.current, CARDS.length) * speed
  })

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 4, 4]} intensity={40} color="#ff2bd6" />
      <pointLight position={[0, 2, -6]} intensity={35} color="#00f6ff" />
      <pointLight position={[4, -1, 2]} intensity={20} color="#ffb000" />
      <SunHorizon />
      <SynthGrid />
      {CARDS.map((card, i) => (
        <ChromeCard
          key={card.title}
          data={card}
          index={i}
          total={CARDS.length}
          continuousIndexRef={continuousIndexRef}
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
  const targetIndexRef = useRef(0)
  const dragStartXRef = useRef(0)
  const dragStartIndexRef = useRef(0)

  const goTo = (i: number) => {
    const wrapped = ((i % CARDS.length) + CARDS.length) % CARDS.length
    setActiveIndex(wrapped)
    targetIndexRef.current = wrapped
  }

  const snapToNearest = () => {
    const wrapped = ((Math.round(targetIndexRef.current) % CARDS.length) + CARDS.length) % CARDS.length
    setActiveIndex(wrapped)
    targetIndexRef.current = wrapped
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true)
    dragStartXRef.current = e.clientX
    dragStartIndexRef.current = targetIndexRef.current
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const dx = e.clientX - dragStartXRef.current
    targetIndexRef.current = dragStartIndexRef.current - dx * 0.006
  }

  const handlePointerUp = () => {
    if (!dragging) return
    setDragging(false)
    snapToNearest()
  }

  return (
    <div className="carousel-wrap">
      <h1 className="carousel-title">
        <span className="accent-a">SYNTH</span>WAVE <span className="accent-b">RING</span>
      </h1>
      <p className="carousel-subtitle">Chrome cards on a rotating ring · drag to spin</p>
      <div
        className="canvas-shell"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
      >
        <Canvas camera={{ position: [0, 0.6, 4.4], fov: 42 }} dpr={[1, 2]}>
          <color attach="background" args={['#0a0014']} />
          <fog attach="fog" args={['#0a0014', 6, 16]} />
          <Scene
            activeIndex={activeIndex}
            setActiveIndex={goTo}
            targetIndexRef={targetIndexRef}
            dragging={dragging}
          />
          <EffectComposer>
            <Bloom intensity={1.1} luminanceThreshold={0.1} luminanceSmoothing={0.4} mipmapBlur />
            <ChromaticAberration offset={[0.0008, 0.0008]} />
            <Vignette eskil={false} offset={0.15} darkness={0.75} />
          </EffectComposer>
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
