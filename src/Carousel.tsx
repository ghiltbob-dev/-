import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'

type CardData = {
  title: string
  subtitle: string
  color: string
}

const CARDS: CardData[] = [
  { title: 'Neural Core', subtitle: 'AI Engine', color: '#7dd3fc' },
  { title: 'Quantum Grid', subtitle: 'Compute Mesh', color: '#a78bfa' },
  { title: 'Holo Stream', subtitle: 'Live Render', color: '#f472b6' },
  { title: 'Cipher Vault', subtitle: 'Secure Layer', color: '#34d399' },
  { title: 'Pulse Net', subtitle: 'Edge Sync', color: '#fbbf24' },
  { title: 'Void Link', subtitle: 'Deep Channel', color: '#60a5fa' },
]

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
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
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
  })

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.6}>
        <group
          onClick={() => onSelect(index)}
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
        </group>
      </Float>
    </group>
  )
}

function Scene({
  activeIndex,
  setActiveIndex,
  targetRotation,
}: {
  activeIndex: number
  setActiveIndex: (i: number) => void
  targetRotation: number
}) {
  const rotationRef = useRef(0)
  const radius = 3.4

  useFrame(() => {
    rotationRef.current += (targetRotation - rotationRef.current) * 0.08
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
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={40} color="#7dd3fc" />
      <pointLight position={[-5, -3, -5]} intensity={30} color="#f472b6" />
      <Environment preset="city" />
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
  const [rotation, setRotation] = useState(0)

  const step = (Math.PI * 2) / CARDS.length

  const goTo = (i: number) => {
    const wrapped = (i + CARDS.length) % CARDS.length
    setActiveIndex(wrapped)
    setRotation(-wrapped * step)
  }

  return (
    <div className="carousel-wrap">
      <h1 className="carousel-title">3D Tech Carousel</h1>
      <p className="carousel-subtitle">Floating glassmorphism cards · futuristic UI</p>
      <div className="canvas-shell">
        <Canvas camera={{ position: [0, 0.6, 6.5], fov: 45 }}>
          <Scene
            activeIndex={activeIndex}
            setActiveIndex={goTo}
            targetRotation={rotation}
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
