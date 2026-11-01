"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { sceneState } from "./scene-state";

/*
 * A real-time architectural model of a gated plotted layout: blocks of plots
 * separated by roads, a park, avenue trees, a compound wall and an entrance
 * arch. Scrolling moves the camera through three chapters: the layout,
 * available plots lighting up in gold, and villas rising on them.
 */

const PALETTE = {
  ground: "#1c2a44",
  road: "#2b3650",
  pad: "#d9cfbb",
  plot: "#f3ecdc",
  plotSold: "#cdbf9f",
  gold: "#f2c063",
  lawn: "#7d9a5b",
  tree: ["#4f7a45", "#5f8a4c", "#6e9a52"],
  trunk: "#6b4f35",
  villa: "#fbf8f1",
  roof: "#24324f",
  wall: "#e9e1cf",
  arch: "#12294b",
};

const PLOT = { w: 2.3, d: 3.1, gap: 0.14, h: 0.12 };
const BLOCK = { cols: 5, rows: 2 };
const ROAD = 2.4;
const GRID = { x: 3, z: 3 };
const PARK = { bx: 2, bz: 0 }; // this block becomes a park

const blockW = BLOCK.cols * (PLOT.w + PLOT.gap);
const blockD = BLOCK.rows * (PLOT.d + PLOT.gap);
const layoutW = GRID.x * blockW + (GRID.x - 1) * ROAD;
const layoutD = GRID.z * blockD + (GRID.z - 1) * ROAD;

// Deterministic randomness so the layout is identical on every visit.
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

type Plot = { x: number; z: number; available: boolean; villa: boolean; delay: number };

function useLayout(lite: boolean) {
  return useMemo(() => {
    const rand = rng(7);
    const plots: Plot[] = [];
    const blocks: { x: number; z: number; park: boolean }[] = [];
    const trees: { x: number; z: number; s: number; c: number }[] = [];

    for (let bx = 0; bx < GRID.x; bx++) {
      for (let bz = 0; bz < GRID.z; bz++) {
        const cx = -layoutW / 2 + bx * (blockW + ROAD) + blockW / 2;
        const cz = -layoutD / 2 + bz * (blockD + ROAD) + blockD / 2;
        const park = bx === PARK.bx && bz === PARK.bz;
        blocks.push({ x: cx, z: cz, park });
        if (park) {
          for (let i = 0; i < (lite ? 10 : 18); i++) {
            const a = rand() * Math.PI * 2;
            const r = 1.2 + rand() * (Math.min(blockW, blockD) / 2 - 1.4);
            trees.push({ x: cx + Math.cos(a) * r * 1.6, z: cz + Math.sin(a) * r * 0.8, s: 0.7 + rand() * 0.5, c: Math.floor(rand() * 3) });
          }
          continue;
        }
        for (let i = 0; i < BLOCK.cols; i++) {
          for (let j = 0; j < BLOCK.rows; j++) {
            const x = cx - blockW / 2 + (i + 0.5) * (PLOT.w + PLOT.gap);
            const z = cz - blockD / 2 + (j + 0.5) * (PLOT.d + PLOT.gap);
            const available = rand() < 0.42;
            plots.push({ x, z, available, villa: !available && rand() < 0.6, delay: rand() });
          }
        }
      }
    }

    // Avenue trees along the two main roads.
    const step = lite ? 3.2 : 2.2;
    for (let bz = 0; bz < GRID.z - 1; bz++) {
      const z = -layoutD / 2 + (bz + 1) * blockD + bz * ROAD + ROAD / 2;
      for (let x = -layoutW / 2; x <= layoutW / 2; x += step) {
        trees.push({ x, z: z - ROAD / 2 + 0.25, s: 0.55 + rand() * 0.2, c: Math.floor(rand() * 3) });
      }
    }
    return { plots, blocks, trees };
  }, [lite]);
}

const smooth = (a: number, b: number, v: number) => {
  const t = THREE.MathUtils.clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

const COLORS = {
  base: new THREE.Color(PALETTE.plot),
  sold: new THREE.Color(PALETTE.plotSold),
  gold: new THREE.Color(PALETTE.gold),
  tmp: new THREE.Color(),
  m: new THREE.Matrix4(),
};

function Plots({ plots, lite }: { plots: Plot[]; lite: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const edges = useRef<THREE.LineSegments>(null);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    plots.forEach((p, i) => {
      m.makeTranslation(p.x, PLOT.h / 2 + 0.06, p.z);
      mesh.current!.setMatrixAt(i, m);
      mesh.current!.setColorAt(i, p.villa ? COLORS.sold : COLORS.base);
    });
    mesh.current!.instanceMatrix.needsUpdate = true;
  }, [plots]);

  // Gold outlines around the available plots, faded in during chapter two.
  const outline = useMemo(() => {
    const pts: number[] = [];
    const hw = PLOT.w / 2 - 0.05;
    const hd = PLOT.d / 2 - 0.05;
    const y = PLOT.h + 0.075;
    for (const p of plots.filter((p) => p.available)) {
      const c = [
        [p.x - hw, p.z - hd],
        [p.x + hw, p.z - hd],
        [p.x + hw, p.z + hd],
        [p.x - hw, p.z + hd],
      ];
      for (let k = 0; k < 4; k++) {
        const [a, b] = [c[k], c[(k + 1) % 4]];
        pts.push(a[0], y, a[1], b[0], y, b[1]);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [plots]);

  useFrame(() => {
    const h = highlight();
    plots.forEach((p, i) => {
      if (!p.available) return;
      COLORS.tmp.copy(COLORS.base).lerp(COLORS.gold, h * 0.9);
      mesh.current!.setColorAt(i, COLORS.tmp);
      // Available plots also rise slightly, so they read even in peripheral vision.
      COLORS.m.makeTranslation(p.x, PLOT.h / 2 + 0.06 + h * 0.18, p.z);
      mesh.current!.setMatrixAt(i, COLORS.m);
    });
    if (mesh.current!.instanceColor) mesh.current!.instanceColor.needsUpdate = true;
    mesh.current!.instanceMatrix.needsUpdate = true;
    edges.current!.position.y = h * 0.18;
    (edges.current!.material as THREE.LineBasicMaterial).opacity = h;
  });

  return (
    <>
      <instancedMesh ref={mesh} args={[undefined, undefined, plots.length]} castShadow={false} receiveShadow={!lite}>
        <boxGeometry args={[PLOT.w, PLOT.h, PLOT.d]} />
        <meshStandardMaterial roughness={0.85} />
      </instancedMesh>
      <lineSegments ref={edges} geometry={outline}>
        <lineBasicMaterial color={PALETTE.gold} transparent opacity={0} />
      </lineSegments>
    </>
  );
}

function Villa({ plot, lite }: { plot: Plot; lite: boolean }) {
  const group = useRef<THREE.Group>(null);
  const rot = useMemo(() => (plot.delay > 0.5 ? 0 : Math.PI / 2), [plot.delay]);
  useFrame(() => {
    const b = build();
    // Staggered: each villa rises in its own slice of the chapter.
    const s = smooth(plot.delay * 0.6, plot.delay * 0.6 + 0.4, b);
    group.current!.scale.set(1, Math.max(s, 0.0001), 1);
    group.current!.visible = s > 0.001;
  });
  return (
    <group ref={group} position={[plot.x, PLOT.h + 0.06, plot.z]} rotation={[0, rot, 0]}>
      {/* Contemporary two-storey villa: white volumes, dark glazing, a warm lit window. */}
      <mesh position={[0, 0.5, -0.1]} castShadow={!lite} receiveShadow={!lite}>
        <boxGeometry args={[1.6, 1, 1.9]} />
        <meshStandardMaterial color={PALETTE.villa} roughness={0.55} />
      </mesh>
      <mesh position={[0.2, 1.3, -0.3]} castShadow={!lite} receiveShadow={!lite}>
        <boxGeometry args={[1.2, 0.6, 1.3]} />
        <meshStandardMaterial color={PALETTE.villa} roughness={0.55} />
      </mesh>
      <mesh position={[0.2, 1.63, -0.2]} castShadow={!lite}>
        <boxGeometry args={[1.45, 0.06, 1.65]} />
        <meshStandardMaterial color="#f4efe4" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.45, 0.856]}>
        <planeGeometry args={[1.2, 0.5]} />
        <meshStandardMaterial color={PALETTE.roof} roughness={0.2} metalness={0.3} />
      </mesh>
      <mesh position={[0.2, 1.3, 0.356]}>
        <planeGeometry args={[0.8, 0.3]} />
        <meshStandardMaterial color={PALETTE.gold} emissive={PALETTE.gold} emissiveIntensity={0.9} />
      </mesh>
      {/* Lawn in front */}
      <mesh position={[0, 0.005, 1.15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={!lite}>
        <planeGeometry args={[2, 0.7]} />
        <meshStandardMaterial color={PALETTE.lawn} roughness={1} />
      </mesh>
    </group>
  );
}

function Trees({ trees, lite }: { trees: { x: number; z: number; s: number; c: number }[]; lite: boolean }) {
  const crowns = useRef<THREE.InstancedMesh>(null);
  const trunks = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    trees.forEach((t, i) => {
      m.compose(new THREE.Vector3(t.x, 0.9 * t.s + 0.1, t.z), new THREE.Quaternion(), new THREE.Vector3(t.s, t.s * 1.1, t.s));
      crowns.current!.setMatrixAt(i, m);
      crowns.current!.setColorAt(i, c.set(PALETTE.tree[t.c]));
      m.compose(new THREE.Vector3(t.x, 0.35 * t.s, t.z), new THREE.Quaternion(), new THREE.Vector3(t.s, t.s, t.s));
      trunks.current!.setMatrixAt(i, m);
    });
    crowns.current!.instanceMatrix.needsUpdate = true;
    trunks.current!.instanceMatrix.needsUpdate = true;
  }, [trees]);
  return (
    <>
      <instancedMesh ref={crowns} args={[undefined, undefined, trees.length]} castShadow={!lite}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial roughness={0.9} flatShading />
      </instancedMesh>
      <instancedMesh ref={trunks} args={[undefined, undefined, trees.length]}>
        <cylinderGeometry args={[0.06, 0.08, 0.7, 6]} />
        <meshStandardMaterial color={PALETTE.trunk} />
      </instancedMesh>
    </>
  );
}

function Site({ lite }: { lite: boolean }) {
  const { plots, blocks, trees } = useLayout(lite);
  const villas = plots.filter((p) => p.villa);
  const wallH = 0.45;
  const pad = 1.2;
  const W = layoutW + pad * 2;
  const D = layoutD + pad * 2;

  return (
    <group>
      {/* Ground (roads) and surroundings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={!lite}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color={PALETTE.ground} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow={!lite}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={PALETTE.road} roughness={0.95} />
      </mesh>

      {/* Block pads (kerbs) and the park */}
      {blocks.map((b) => (
        <mesh key={`${b.x}-${b.z}`} position={[b.x, 0.03, b.z]} receiveShadow={!lite}>
          <boxGeometry args={[blockW + 0.25, 0.06, blockD + 0.25]} />
          <meshStandardMaterial color={b.park ? PALETTE.lawn : PALETTE.pad} roughness={0.95} />
        </mesh>
      ))}
      {blocks
        .filter((b) => b.park)
        .map((b) => (
          <mesh key="fountain" position={[b.x, 0.12, b.z]} receiveShadow={!lite}>
            <cylinderGeometry args={[1.1, 1.1, 0.12, 32]} />
            <meshStandardMaterial color={PALETTE.pad} />
          </mesh>
        ))}

      <Plots plots={plots} lite={lite} />
      {villas.map((p, i) => (
        <Villa key={i} plot={p} lite={lite} />
      ))}
      <Trees trees={trees} lite={lite} />

      {/* Compound wall with a gap for the entrance */}
      {[
        [0, -D / 2, W, 0.18],
        [-W / 2, 0, 0.18, D],
        [W / 2, 0, 0.18, D],
        [-(W / 4 + 1.6), D / 2, W / 2 - 3.2, 0.18],
        [W / 4 + 1.6, D / 2, W / 2 - 3.2, 0.18],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, wallH / 2, z]} castShadow={!lite}>
          <boxGeometry args={[w, wallH, d]} />
          <meshStandardMaterial color={PALETTE.wall} roughness={0.8} />
        </mesh>
      ))}

      {/* Entrance arch */}
      <group position={[0, 0, D / 2]}>
        {[-1.8, 1.8].map((x) => (
          <mesh key={x} position={[x, 1.2, 0]} castShadow={!lite}>
            <boxGeometry args={[0.5, 2.4, 0.5]} />
            <meshStandardMaterial color={PALETTE.arch} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 2.55, 0]} castShadow={!lite}>
          <boxGeometry args={[4.6, 0.5, 0.6]} />
          <meshStandardMaterial color={PALETTE.arch} roughness={0.4} />
        </mesh>
        <mesh position={[0, 2.55, 0.31]}>
          <planeGeometry args={[3.2, 0.16]} />
          <meshStandardMaterial color={PALETTE.gold} emissive={PALETTE.gold} emissiveIntensity={1.2} />
        </mesh>
      </group>
    </group>
  );
}

// ---- Story timeline -------------------------------------------------------

const clock = { start: 0 };
let intro = 0;

/** 0..1 progress of the story: scroll on desktop, a looping timer on phones. */
function story() {
  if (!sceneState.autoplay) return sceneState.progress;
  const t = (performance.now() - clock.start) / 1000;
  // Hold the layout, light up plots, raise villas, then hold.
  return Math.min(1, Math.max(0, (t - 3) / 9));
}
const highlight = () => smooth(0.22, 0.5, story()) * intro;
const build = () => smooth(0.55, 0.95, story());

const KEYS = [
  { at: 0, pos: new THREE.Vector3(30, 28, 40), look: new THREE.Vector3(0, 0, 0) },
  { at: 0.5, pos: new THREE.Vector3(-22, 17, 26), look: new THREE.Vector3(2, 0, -1) },
  { at: 1, pos: new THREE.Vector3(15, 12, 25), look: new THREE.Vector3(2, 0.5, 2) },
];
const TOP = new THREE.Vector3(0.1, 95, 0.1);

// Per-frame scratch values live at module level: the render loop mutates them
// 60 times a second, which is exactly what React state must not do.
const rig = { pos: new THREE.Vector3(), look: new THREE.Vector3(), lookNow: new THREE.Vector3(), ptr: { x: 0, y: 0 } };

function CameraRig() {
  useEffect(() => {
    clock.start = performance.now();
    intro = 0;
  }, []);

  useFrame((state, dt) => {
    const { pos, look, lookNow, ptr } = rig;
    // Intro: drop from a top-down view into the aerial view.
    intro = Math.min(1, intro + dt / 2.8);
    const e = 1 - Math.pow(1 - intro, 3);

    const p = story();
    const k = p < 0.5 ? 0 : 1;
    const seg = smooth(KEYS[k].at, KEYS[k + 1].at, p);
    pos.lerpVectors(KEYS[k].pos, KEYS[k + 1].pos, seg);
    look.lerpVectors(KEYS[k].look, KEYS[k + 1].look, seg);

    // Slow drift and pointer parallax keep the model alive at rest.
    const t = state.clock.elapsedTime;
    ptr.x += (sceneState.pointer.x - ptr.x) * 0.05;
    ptr.y += (sceneState.pointer.y - ptr.y) * 0.05;
    pos.x += Math.sin(t * 0.12) * 1.5 + ptr.x * 2.5;
    pos.y += ptr.y * 1.5;

    state.camera.position.lerpVectors(TOP, pos, e);
    lookNow.lerp(look, 0.08);
    state.camera.lookAt(lookNow);
  });
  return null;
}

export default function SitePlanScene({ lite, paused, onReady }: { lite: boolean; paused: boolean; onReady: () => void }) {
  return (
    <Canvas
      aria-hidden
      frameloop={paused ? "never" : "always"}
      dpr={lite ? [1, 1.5] : [1, 1.75]}
      shadows={lite ? false : "percentage"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 32, near: 0.5, far: 220, position: [0.1, 95, 0.1] }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.25;
        scene.fog = new THREE.Fog("#0b1f3a", 55, 120);
        // Reveal on the next frame, once something has been drawn.
        requestAnimationFrame(onReady);
      }}
    >
      <hemisphereLight args={["#fff4dc", "#3a4560", 1.35]} />
      <directionalLight
        position={[32, 38, 18]}
        intensity={2.8}
        color="#ffd9a3"
        castShadow={!lite}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0004}
      />
      <Site lite={lite} />
      <CameraRig />
    </Canvas>
  );
}
