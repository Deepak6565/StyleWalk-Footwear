import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, useTexture, ContactShadows, Float } from '@react-three/drei';
import { RotateCw, Eye, Sparkles, Layers, Sliders, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 3D Exploded Layer Deconstruction Component
function ExplodedFootwearStage({ isAutoSpinning, explosionLevel, onSelectHotspot }) {
  const stageRef = useRef();

  // Load high-res clean exploded footwear texture
  const texture = useTexture('/exploded_sneaker.png');

  // Auto spin rotation animation
  useFrame((state, delta) => {
    if (isAutoSpinning && stageRef.current) {
      stageRef.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <group ref={stageRef} position={[0, 0, 0]} rotation={[0.05, -0.2, 0]}>
      
      {/* Sleek Dark Showroom Base Pedestal */}
      <mesh position={[0, -1.5, 0]} receiveShadow>
        <cylinderGeometry args={[1.8, 2.0, 0.2, 64]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Neon Cyan Base Ring Light */}
      <mesh position={[0, -1.39, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.75, 0.03, 16, 64]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2.5} />
      </mesh>

      {/* Main Floating 3D Deconstructed Plane */}
      <group position={[0, 0.1, 0]}>
        
        {/* Front Face of Deconstructed Exploded View */}
        <mesh position={[0, 0, 0.02]} castShadow>
          <planeGeometry args={[3.2, 3.2]} />
          <meshStandardMaterial
            map={texture}
            transparent
            alphaTest={0.15}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>

        {/* Back Face for 360 Spin */}
        <mesh position={[0, 0, -0.02]} rotation={[0, Math.PI, 0]} castShadow>
          <planeGeometry args={[3.2, 3.2]} />
          <meshStandardMaterial
            map={texture}
            transparent
            alphaTest={0.15}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      </group>

      {/* 3D Hotspot Pins Positioned Over Exploded Layers */}
      
      {/* Hotspot 1: Knitted Sock Collar (Top) */}
      <Html position={[0.25, 1.15, 0.2]} center distanceFactor={6}>
        <button
          onClick={() => onSelectHotspot('sock_collar')}
          className="relative group focus:outline-none cursor-pointer"
          data-cursor="hotspot"
        >
          <div className="w-7 h-7 rounded-full bg-cyan-400 text-gray-950 flex items-center justify-center font-black text-xs shadow-lg pulse-hotspot hover:scale-125 transition-transform">
            1
          </div>
          <span className="absolute left-8 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-gray-950/95 text-cyan-300 border border-cyan-400/40 text-[10px] font-black uppercase whitespace-nowrap shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            [1] Knitted Sock Collar
          </span>
        </button>
      </Html>

      {/* Hotspot 2: Titanium Upper Cage (Upper Middle) */}
      <Html position={[-0.4, 0.45, 0.2]} center distanceFactor={6}>
        <button
          onClick={() => onSelectHotspot('upper_cage')}
          className="relative group focus:outline-none cursor-pointer"
          data-cursor="hotspot"
        >
          <div className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center font-black text-xs shadow-lg pulse-hotspot hover:scale-125 transition-transform">
            2
          </div>
          <span className="absolute left-8 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-gray-950/95 text-indigo-300 border border-indigo-500/40 text-[10px] font-black uppercase whitespace-nowrap shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            [2] Titanium Upper Cage
          </span>
        </button>
      </Html>

      {/* Hotspot 3: Cyber Grid Insole (Middle) */}
      <Html position={[0.4, -0.05, 0.2]} center distanceFactor={6}>
        <button
          onClick={() => onSelectHotspot('insole_grid')}
          className="relative group focus:outline-none cursor-pointer"
          data-cursor="hotspot"
        >
          <div className="w-7 h-7 rounded-full bg-purple-500 text-white flex items-center justify-center font-black text-xs shadow-lg pulse-hotspot hover:scale-125 transition-transform">
            3
          </div>
          <span className="absolute left-8 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-gray-950/95 text-purple-300 border border-purple-500/40 text-[10px] font-black uppercase whitespace-nowrap shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            [3] Orthotic Grid Insole
          </span>
        </button>
      </Html>

      {/* Hotspot 4: Aerogel Cushioning Midsole (Lower Middle) */}
      <Html position={[-0.5, -0.4, 0.2]} center distanceFactor={6}>
        <button
          onClick={() => onSelectHotspot('aerogel_midsole')}
          className="relative group focus:outline-none cursor-pointer"
          data-cursor="hotspot"
        >
          <div className="w-7 h-7 rounded-full bg-amber-400 text-gray-950 flex items-center justify-center font-black text-xs shadow-lg pulse-hotspot hover:scale-125 transition-transform">
            4
          </div>
          <span className="absolute left-8 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-gray-950/95 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase whitespace-nowrap shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            [4] Aerogel Cushioning Midsole
          </span>
        </button>
      </Html>

      {/* Hotspot 5: Carbon Fiber Propulsion Shank (Bottom) */}
      <Html position={[0.3, -0.75, 0.2]} center distanceFactor={6}>
        <button
          onClick={() => onSelectHotspot('carbon_plate')}
          className="relative group focus:outline-none cursor-pointer"
          data-cursor="hotspot"
        >
          <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center font-black text-xs shadow-lg pulse-hotspot hover:scale-125 transition-transform">
            5
          </div>
          <span className="absolute left-8 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-gray-950/95 text-rose-300 border border-rose-500/40 text-[10px] font-black uppercase whitespace-nowrap shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            [5] Carbon Fiber Velocity Shank
          </span>
        </button>
      </Html>

      {/* Hotspot 6: Multi-Terrain Traction Sole (Base) */}
      <Html position={[-0.4, -1.05, 0.2]} center distanceFactor={6}>
        <button
          onClick={() => onSelectHotspot('outsole_tread')}
          className="relative group focus:outline-none cursor-pointer"
          data-cursor="hotspot"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-400 text-gray-950 flex items-center justify-center font-black text-xs shadow-lg pulse-hotspot hover:scale-125 transition-transform">
            6
          </div>
          <span className="absolute left-8 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-gray-950/95 text-emerald-300 border border-emerald-400/40 text-[10px] font-black uppercase whitespace-nowrap shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            [6] Multi-Terrain Traction Outsole
          </span>
        </button>
      </Html>

    </group>
  );
}

function Loader() {
  return (
    <Html center>
      <div className="text-xs font-black text-cyan-400 uppercase tracking-widest animate-pulse">
        Initializing 3D Layer Breakdown...
      </div>
    </Html>
  );
}

export default function Shoe3DCanvas({ 
  shoeName = "Phantom Stealth X1"
}) {
  const [isAutoSpinning, setIsAutoSpinning] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState(null);

  const layerSpecs = {
    sock_collar: {
      title: "Anatomical Knitted Sock Collar",
      description: "Seamless micro-ribbed elastic collar that locks the ankle in place, preventing slippage while eliminating friction points.",
      badge: "ERGONOMIC LOCK"
    },
    upper_cage: {
      title: "Titanium CyberMesh Upper Cage",
      description: "Ultra-lightweight aerospace weave reinforced with molded TPU side pillars for lateral stability during high-speed directional cuts.",
      badge: "TITANIUM CAGE"
    },
    insole_grid: {
      title: "Cyber-Grid Orthotic Insole",
      description: "Pressure-mapped antimicrobial footbed that conforms to the plantar arch for customized long-distance comfort.",
      badge: "ORTHOTIC FIT"
    },
    aerogel_midsole: {
      title: "NASA Aerogel Impact Midsole",
      description: "High-density encapsulated aerogel cell matrix absorbing 98.4% of heel strike shock while rebounding energy into your next stride.",
      badge: "AEROSPACE CUSHION"
    },
    carbon_plate: {
      title: "Forged Carbon Fiber Velocity Shank",
      description: "Full-length 3D contoured carbon shank that snaps back on toe-off, boosting propulsion velocity by 14.2%.",
      badge: "KINETIC ASSIST"
    },
    outsole_tread: {
      title: "Multi-Terrain Lugged Traction Sole",
      description: "Segmented high-abrasion rubber pods arranged in dual-directional traction geometry for maximum grip on wet and dry surfaces.",
      badge: "ALL-WEATHER GRIP"
    }
  };

  return (
    <div 
      className="relative w-full h-[450px] sm:h-[520px] rounded-3xl glass-panel border border-cyan-500/30 overflow-hidden shadow-2xl flex flex-col justify-between p-4" 
      data-cursor="drag"
    >
      {/* Top Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
        <div className="text-left">
          <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 backdrop-blur-md flex items-center gap-1.5 w-fit">
            <Layers className="w-3 h-3 text-cyan-400" />
            3D Exploded Layer Deconstruction Stage
          </span>
          <h3 className="text-xl font-black text-white mt-1 drop-shadow">{shoeName}</h3>
        </div>

        {/* 360 Spin Toggle Button */}
        <button
          onClick={() => setIsAutoSpinning(!isAutoSpinning)}
          className={`pointer-events-auto px-3.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center space-x-2 backdrop-blur-md cursor-pointer ${
            isAutoSpinning
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-lg shadow-cyan-500/20'
              : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20'
          }`}
          data-cursor="hover"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isAutoSpinning ? 'animate-spin' : ''}`} />
          <span>{isAutoSpinning ? '360° Auto Spin ON' : 'Pause Spin'}</span>
        </button>
      </div>

      {/* 3D WebGL Canvas Stage */}
      <div className="w-full h-full relative z-10">
        <Canvas camera={{ position: [0, 0.4, 4.2], fov: 45 }}>
          <ambientLight intensity={1.1} />
          <directionalLight position={[5, 10, 5]} intensity={1.6} castShadow />
          <pointLight position={[-5, -2, -2]} color="#06b6d4" intensity={2.5} />
          <pointLight position={[5, -2, 2]} color="#6366f1" intensity={2.5} />

          <React.Suspense fallback={<Loader />}>
            <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.2}>
              <ExplodedFootwearStage
                isAutoSpinning={isAutoSpinning}
                onSelectHotspot={(key) => setActiveHotspot(key)}
              />
            </Float>
          </React.Suspense>

          <ContactShadows position={[0, -1.6, 0]} opacity={0.6} scale={9} blur={2.5} far={4} color="#080b11" />
          <OrbitControls 
            enableZoom={false} 
            maxPolarAngle={Math.PI / 2 + 0.1} 
            minPolarAngle={Math.PI / 4}
            rotateSpeed={0.8}
          />
        </Canvas>
      </div>

      {/* Footer Helper Badge */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-center text-[11px] text-gray-400 pointer-events-none">
        <div className="flex items-center space-x-2 bg-gray-950/85 px-3.5 py-1.5 rounded-xl border border-cyan-500/30 backdrop-blur-md">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Drag mouse to tilt 3D exploded view • Click pins [1-6] to inspect layer engineering</span>
        </div>
      </div>

      {/* Hotspot Layer Detail Popup Modal */}
      <AnimatePresence>
        {activeHotspot && layerSpecs[activeHotspot] && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 left-4 right-4 z-30 p-4 rounded-2xl glass-panel border border-cyan-500/40 shadow-2xl text-left bg-gray-950/95 text-white pointer-events-auto"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {layerSpecs[activeHotspot].badge}
                </span>
                <h4 className="text-base font-black text-white mt-1">
                  {layerSpecs[activeHotspot].title}
                </h4>
              </div>
              <button
                onClick={() => setActiveHotspot(null)}
                className="p-1 rounded bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-300 mt-2 leading-relaxed font-semibold">
              {layerSpecs[activeHotspot].description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
