"use client";
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, TransformControls, Html } from "@react-three/drei";
import * as THREE from "three";

// --- Furniture Types ---
const FURNITURE_TYPES = [
  {
    type: "Chair",
    color: "#8e44ad",
    geometry: (props: any) => <boxGeometry args={[0.6, 0.6, 0.6]} {...props} />,
    size: [0.6, 0.6, 0.6] as [number, number, number],
  },
  {
    type: "Table",
    color: "#e67e22",
    geometry: (props: any) => <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} {...props} />,
    size: [1, 0.1, 1] as [number, number, number],
  },
  {
    type: "Sofa",
    color: "#16a085",
    geometry: (props: any) => <boxGeometry args={[1.2, 0.5, 0.5]} {...props} />,
    size: [1.2, 0.5, 0.5] as [number, number, number],
  },
  {
    type: "Bed",
    color: "#2980b9",
    geometry: (props: any) => <boxGeometry args={[1.5, 0.3, 0.8]} {...props} />,
    size: [1.5, 0.3, 0.8] as [number, number, number],
  },
];

type FurnitureType = typeof FURNITURE_TYPES[number]["type"];

type FurnitureItem = {
  id: string;
  type: FurnitureType;
  color: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  size: [number, number, number];
};

// --- Utility: Generate unique IDs ---
const genId = (() => {
  let i = 0;
  return () => `furniture-${i++}`;
})();

// --- Collision Detection ---
function isColliding(a: FurnitureItem, b: FurnitureItem) {
  // Simple AABB collision
  return (
    Math.abs(a.position[0] - b.position[0]) < (a.size[0] + b.size[0]) / 2 &&
    Math.abs(a.position[2] - b.position[2]) < (a.size[2] + b.size[2]) / 2
  );
}

// --- Furniture Mesh ---
function Furniture({ item, selected, onSelect, onTransform, allFurniture }: {
  item: FurnitureItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onTransform: (id: string, position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => void;
  allFurniture: FurnitureItem[];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  // For collision, store last valid position
  const lastValid = useRef(item.position);

  // Update last valid position if not colliding
  useEffect(() => {
    if (!selected) return;
    const myBox = {
      position: item.position,
      size: item.size,
    };
    const others = allFurniture.filter((f) => f.id !== item.id);
    const collides = others.some((f) =>
      isColliding(myBox as FurnitureItem, f)
    );
    if (!collides) {
      lastValid.current = item.position;
    } else {
      // Snap back
      onTransform(item.id, lastValid.current, item.rotation, item.scale);
    }
  }, [item.position, allFurniture, item.id, item.size, item.rotation, item.scale, selected, onTransform]);

  return (
    <group>
      <mesh
        ref={meshRef}
        position={item.position}
        rotation={item.rotation}
        scale={item.scale}
        castShadow
        receiveShadow
        onPointerDown={(e) => {
          e.stopPropagation();
          onSelect(item.id);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {FURNITURE_TYPES.find((f) => f.type === item.type)?.geometry({})}
        <meshStandardMaterial color={hovered || selected ? "#f1c40f" : item.color} />
      </mesh>
      {/* Label */}
      <Html position={[item.position[0], item.position[1] + item.size[1] / 2 + 0.2, item.position[2]]} center style={{ pointerEvents: "none" }}>
        <div style={{
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          padding: "2px 8px",
          borderRadius: 4,
          fontSize: 12,
        }}>{item.type}</div>
      </Html>
      {/* Shadow */}
      <mesh
        position={[item.position[0], 0.01, item.position[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[Math.max(item.size[0], item.size[2]) * 0.45, 24]} />
        <meshBasicMaterial color="#000" opacity={0.18} transparent />
      </mesh>
    </group>
  );
}

// --- Transform Controls Wrapper ---
function Transformable({ item, selected, onSelect, onTransform, allFurniture }: {
  item: FurnitureItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onTransform: (id: string, position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => void;
  allFurniture: FurnitureItem[];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const controls = useRef<any>(null);

  if (!selected) {
    return (
      <Furniture item={item} selected={false} onSelect={onSelect} onTransform={onTransform} allFurniture={allFurniture} />
    );
  }
  return (
    <TransformControls
      ref={controls}
      object={meshRef.current}
      mode="translate"
      showX showY={false} showZ
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect(item.id);
      }}
      onObjectChange={() => {
        const obj = meshRef.current;
        if (obj) {
          onTransform(
            item.id,
            [obj.position.x, obj.position.y, obj.position.z],
            [obj.rotation.x, obj.rotation.y, obj.rotation.z],
            [obj.scale.x, obj.scale.y, obj.scale.z]
          );
        }
      }}
    >
      <Furniture item={item} selected={true} onSelect={onSelect} onTransform={onTransform} allFurniture={allFurniture} />
    </TransformControls>
  );
}

// --- Camera Views ---
const CAMERA_VIEWS = {
  top: { position: [0, 8, 0.01] as [number, number, number], lookAt: [0, 0, 0] as [number, number, number] },
  side: { position: [8, 3, 0] as [number, number, number], lookAt: [0, 0, 0] as [number, number, number] },
  free: null,
};

function CameraController({ view }: { view: keyof typeof CAMERA_VIEWS }) {
  const { camera } = useThree();
  useEffect(() => {
    if (view === "free" || !CAMERA_VIEWS[view]) return;
    const { position, lookAt } = CAMERA_VIEWS[view]!;
    camera.position.set(position[0], position[1], position[2]);
    camera.lookAt(lookAt[0], lookAt[1], lookAt[2]);
  }, [view, camera]);
  return null;
}

// --- Main Page ---
export default function Page() {
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cameraView, setCameraView] = useState<keyof typeof CAMERA_VIEWS>("free");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [spacelyResult, setSpacelyResult] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Add furniture
  const addFurniture = (type: FurnitureType) => {
    const def = FURNITURE_TYPES.find((f) => f.type === type);
    if (!def) return;
    setFurniture((prev) => [
      ...prev,
      {
        id: genId(),
        type,
        color: def.color,
        position: [Math.random() * 2 - 1, def.size[1] / 2, Math.random() * 2 - 1],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        size: def.size,
      },
    ]);
  };

  // Remove furniture
  const removeFurniture = (id: string) => {
    setFurniture((prev) => prev.filter((f) => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // Transform handler
  const handleTransform = (id: string, position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => {
    setFurniture((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, position, rotation, scale } : f
      )
    );
  };

  // Screenshot
  const handleScreenshot = () => {
    // Find the canvas element
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = (canvas as HTMLCanvasElement).toDataURL("image/png");
    setScreenshot(dataUrl);
  };

  // Spacely API integration
  const handleSpacely = async () => {
    if (!screenshot) return;
    const apiKey = "sk-ibTAcMYJrMddDZjRGRLuUXSHHKg";
    const res = await fetch("https://api.spacely.ai/api/v1/generate/standard", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "spacely-v1",
        imageUrl: screenshot, // This may need to be a real URL; for demo, try data URL
        spaceType: "living_room",
        spaceStyle: "modern",
        renovateType: "residential",
      }),
    });
    const { data: refId } = await res.json();
    let tries = 0;
    let result: string[] = [];
    while (tries < 20) {
      await new Promise((r) => setTimeout(r, 2000));
      const poll = await fetch(
        `https://api.spacely.ai/api/v1/generate/poll-result?refId=${refId}`,
        {
          headers: { "X-API-KEY": apiKey },
        }
      );
      const pollData = await poll.json();
      if (pollData.data.status === "success") {
        result = pollData.data.result;
        break;
      }
      if (pollData.data.status === "failed") break;
      tries++;
    }
    setSpacelyResult(result);
  };

  // --- UI ---
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: "#222", color: "#fff", padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Furniture</h2>
        {FURNITURE_TYPES.map((f) => (
          <button
            key={f.type}
            style={{ background: f.color, color: "#fff", border: "none", borderRadius: 4, padding: "8px 12px", marginBottom: 4, cursor: "pointer" }}
            onClick={() => addFurniture(f.type)}
          >
            Add {f.type}
          </button>
        ))}
        <hr style={{ border: "1px solid #444" }} />
        <h2 style={{ fontSize: 18, margin: 0 }}>Camera</h2>
        <button style={{ marginBottom: 4 }} onClick={() => setCameraView("top")}>Top View</button>
        <button style={{ marginBottom: 4 }} onClick={() => setCameraView("side")}>Side View</button>
        <button style={{ marginBottom: 4 }} onClick={() => setCameraView("free")}>Free Orbit</button>
        <hr style={{ border: "1px solid #444" }} />
        <h2 style={{ fontSize: 18, margin: 0 }}>Actions</h2>
        <button style={{ marginBottom: 4 }} onClick={handleScreenshot}>Screenshot</button>
        <button style={{ marginBottom: 4 }} onClick={handleSpacely} disabled={!screenshot}>Send to Spacely</button>
        <hr style={{ border: "1px solid #444" }} />
        <h2 style={{ fontSize: 18, margin: 0 }}>Selected</h2>
        {selectedId ? (
          <>
            <div style={{ marginBottom: 8 }}>ID: {selectedId}</div>
            <button style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: 4, padding: "6px 10px", cursor: "pointer" }} onClick={() => removeFurniture(selectedId)}>Remove</button>
          </>
        ) : (
          <div style={{ color: "#aaa" }}>None</div>
        )}
      </div>
      {/* Main 3D Canvas */}
      <div style={{ flex: 1, position: "relative", background: "#111" }}>
        <Canvas
          shadows
          camera={{ position: [5, 5, 5], fov: 50 }}
          style={{ width: "100%", height: "100%" }}
          onPointerMissed={() => setSelectedId(null)}
        >
          <color attach="background" args={["#222"]} />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 10, 7]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0001}
          />
          {/* Room: Floor and Walls */}
          <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[8, 8]} />
            <meshStandardMaterial color="#444" />
          </mesh>
          {/* Walls */}
          <mesh position={[0, 1, -4]} receiveShadow>
            <boxGeometry args={[8, 2, 0.1]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[-4, 1, 0]} receiveShadow>
            <boxGeometry args={[0.1, 2, 8]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[4, 1, 0]} receiveShadow>
            <boxGeometry args={[0.1, 2, 8]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          {/* Furniture */}
          {furniture.map((item) => (
            <Transformable
              key={item.id}
              item={item}
              selected={selectedId === item.id}
              onSelect={setSelectedId}
              onTransform={handleTransform}
              allFurniture={furniture}
            />
          ))}
          {/* Camera Controls */}
          <CameraController view={cameraView} />
          {cameraView === "free" && <OrbitControls makeDefault enableDamping />}
        </Canvas>
        {/* Screenshot Preview */}
        {screenshot && (
          <div style={{ position: "absolute", bottom: 16, right: 16, background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0006", padding: 8 }}>
            <div style={{ fontSize: 12, color: "#222", marginBottom: 4 }}>Screenshot Preview</div>
            <img src={screenshot} alt="Screenshot" style={{ width: 180, borderRadius: 4 }} />
          </div>
        )}
      </div>
      {/* Spacely Result Preview */}
      <div style={{ width: 260, background: "#222", color: "#fff", padding: 16, overflowY: "auto" }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Spacely Result</h2>
        {spacelyResult.length === 0 && <div style={{ color: "#aaa" }}>No result yet.</div>}
        {spacelyResult.map((url, i) => (
          <img key={i} src={url} alt={`Spacely result ${i}`} style={{ width: "100%", borderRadius: 8, marginBottom: 12 }} />
        ))}
      </div>
    </div>
  );
}
