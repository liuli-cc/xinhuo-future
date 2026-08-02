"use client";

import * as THREE from "three";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef } from "react";

gsap.registerPlugin(useGSAP);

export type InterviewerState = "idle" | "thinking" | "speaking" | "listening" | "scoring";

interface VirtualInterviewerProps {
  state: InterviewerState;
  audioLevel?: number;
  ttsSource?: "tencent" | "browser" | "none";
}

type Rig = {
  root: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  eyes: THREE.Mesh[];
};

type Pose = {
  headTilt: number;
  headTurn: number;
  headNod: number;
  leftArm: number;
  rightArm: number;
  rightArmPitch: number;
};

function capsule(
  radius: number,
  length: number,
  material: THREE.Material,
  rotationZ = 0,
) {
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 8, 18), material);
  mesh.rotation.z = rotationZ;
  mesh.castShadow = true;
  return mesh;
}

function rodBetween(
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  material: THREE.Material,
) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, direction.length(), 10),
    material,
  );
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize(),
  );
  return mesh;
}

function buildLiuliTeacher(scene: THREE.Scene): Rig {
  const root = new THREE.Group();
  root.position.y = -0.14;
  scene.add(root);

  const blue = new THREE.MeshStandardMaterial({ color: 0x35a8e0, roughness: 0.5 });
  const blueSoft = new THREE.MeshStandardMaterial({ color: 0x7dd3fc, roughness: 0.62 });
  const ivory = new THREE.MeshStandardMaterial({ color: 0xfffcf2, roughness: 0.8 });
  const ink = new THREE.MeshStandardMaterial({ color: 0x182432, roughness: 0.55 });
  const coral = new THREE.MeshStandardMaterial({ color: 0xff5c62, roughness: 0.48 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xf7c948, metalness: 0.12, roughness: 0.42 });
  const blush = new THREE.MeshStandardMaterial({ color: 0xff8f9c, transparent: true, opacity: 0.34 });

  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.58, 32, 24), blue);
  torso.scale.set(0.96, 1.08, 0.76);
  torso.position.y = -0.78;
  torso.castShadow = true;
  root.add(torso);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.4, 28, 20), ivory);
  belly.scale.set(0.96, 1.08, 0.3);
  belly.position.set(0, -0.76, 0.48);
  root.add(belly);

  const collar = capsule(0.08, 0.68, coral, Math.PI / 2);
  collar.scale.z = 0.72;
  collar.position.set(0, -0.24, 0.02);
  root.add(collar);

  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 14), gold);
  bell.scale.y = 0.9;
  bell.position.set(0, -0.31, 0.61);
  bell.castShadow = true;
  root.add(bell);
  const bellMark = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.018, 0.03), ink);
  bellMark.position.set(0, -0.29, 0.72);
  root.add(bellMark);

  const head = new THREE.Group();
  head.position.y = 0.48;
  root.add(head);

  const headShell = new THREE.Mesh(new THREE.SphereGeometry(0.72, 36, 28), blue);
  headShell.scale.set(1, 0.96, 0.88);
  headShell.castShadow = true;
  head.add(headShell);

  [-1, 1].forEach(side => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.46, 4), blue);
    ear.position.set(side * 0.48, 0.55, -0.03);
    ear.rotation.set(0.12, 0, side * -0.13);
    ear.castShadow = true;
    head.add(ear);

    const earInset = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.29, 4), blueSoft);
    earInset.position.set(side * 0.48, 0.57, 0.11);
    earInset.rotation.set(0.12, 0, side * -0.13);
    head.add(earInset);
  });

  const face = new THREE.Mesh(new THREE.SphereGeometry(0.59, 32, 24), ivory);
  face.scale.set(0.88, 0.86, 0.46);
  face.position.set(0, -0.05, 0.48);
  face.castShadow = true;
  head.add(face);

  const eyes: THREE.Mesh[] = [];
  [-0.17, 0.17].forEach(x => {
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 16), ivory);
    eyeWhite.scale.set(0.72, 1.18, 0.45);
    eyeWhite.position.set(x, 0.18, 0.7);
    head.add(eyeWhite);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.064, 16, 12), ink);
    pupil.scale.set(0.78, 1.15, 0.48);
    pupil.position.set(x, 0.15, 0.84);
    head.add(pupil);
    eyes.push(pupil);

    const eyeLight = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), ivory);
    eyeLight.position.set(x - 0.018, 0.18, 0.895);
    head.add(eyeLight);

    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 10), blush);
    cheek.scale.set(1.45, 0.48, 0.3);
    cheek.position.set(x * 1.7, -0.14, 0.76);
    head.add(cheek);
  });

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 14), coral);
  nose.position.set(0, -0.02, 0.88);
  nose.castShadow = true;
  head.add(nose);

  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.13, 0.014, 8, 28, Math.PI),
    ink,
  );
  smile.rotation.z = Math.PI;
  smile.position.set(0, -0.2, 0.85);
  head.add(smile);

  const noseLine = rodBetween(
    new THREE.Vector3(0, -0.08, 0.865),
    new THREE.Vector3(0, -0.18, 0.865),
    0.009,
    ink,
  );
  head.add(noseLine);

  [-1, 1].forEach(side => {
    [-0.11, 0, 0.11].forEach(offset => {
      const whisker = rodBetween(
        new THREE.Vector3(side * 0.23, -0.12 + offset, 0.82),
        new THREE.Vector3(side * 0.56, -0.13 + offset * 1.35, 0.76),
        0.009,
        ink,
      );
      head.add(whisker);
    });
  });

  const makeArm = (side: -1 | 1) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.53, -0.52, 0.05);
    const sleeve = capsule(0.15, 0.46, blue, side * -0.06);
    sleeve.position.y = -0.25;
    pivot.add(sleeve);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 14), ivory);
    hand.position.set(side * 0.04, -0.58, 0.02);
    hand.castShadow = true;
    pivot.add(hand);
    root.add(pivot);
    return pivot;
  };

  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);

  return { root, head, leftArm, rightArm, eyes };
}

export default function VirtualInterviewer({
  state,
  audioLevel = 0,
  ttsSource = "none",
}: VirtualInterviewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  const audioLevelRef = useRef(audioLevel);
  const rigRef = useRef<Rig | null>(null);
  const reducedMotionRef = useRef(false);
  const poseRef = useRef<Pose>({
    headTilt: 0,
    headTurn: 0,
    headNod: 0,
    leftArm: 0.08,
    rightArm: -0.08,
    rightArmPitch: 0,
  });

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { audioLevelRef.current = audioLevel; }, [audioLevel]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 0.22, 5.35);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xeaf8ff, 0x17284a, 2.7));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.3);
    keyLight.position.set(2.8, 4.2, 4.5);
    keyLight.castShadow = true;
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x65c9ff, 2.2);
    rimLight.position.set(-3.5, 1.4, -2);
    scene.add(rimLight);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(1.35, 48),
      new THREE.MeshStandardMaterial({ color: 0x4cb9ed, transparent: true, opacity: 0.24, roughness: 1 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.48;
    floor.receiveShadow = true;
    scene.add(floor);

    const rig = buildLiuliTeacher(scene);
    rigRef.current = rig;
    const poseState = poseRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reducedMotionRef.current = reducedMotion;
    let frame = 0;
    let disposed = false;
    const startedAt = Date.now();

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const render = () => {
      if (disposed) return;
      const t = (Date.now() - startedAt) / 1000;
      const current = stateRef.current;
      const motion = reducedMotion ? 0 : 1;
      const pose = poseState;
      rig.root.position.y = -0.14 + Math.sin(t * 1.8) * 0.018 * motion;
      rig.root.rotation.y = Math.sin(t * 0.48) * 0.035 * motion;
      rig.head.rotation.set(
        pose.headNod + (current === "speaking" ? Math.sin(t * 3.4) * 0.018 * motion : 0),
        pose.headTurn,
        pose.headTilt + (current === "listening" ? Math.sin(t * 1.4) * 0.018 * motion : 0),
      );
      rig.leftArm.rotation.set(0, 0, pose.leftArm);
      rig.rightArm.rotation.set(
        pose.rightArmPitch,
        0,
        pose.rightArm + (current === "speaking" ? Math.sin(t * 4.4) * 0.12 * motion : current === "scoring" ? Math.sin(t * 5) * 0.03 * motion : 0),
      );

      const blink = !reducedMotion && Math.sin(t * 0.82) > 0.992;
      rig.eyes.forEach(eye => { eye.scale.y = blink ? 0.08 : 1; });
      const voiceBounce = current === "speaking" ? Math.min(0.04, audioLevelRef.current * 0.04) : 0;
      rig.head.position.y = voiceBounce;

      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      gsap.killTweensOf(poseState);
      rigRef.current = null;
      renderer.dispose();
      renderer.domElement.remove();
      scene.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(material => material.dispose());
      });
    };
  }, []);

  useGSAP(() => {
    if (!rigRef.current) return;
    const target: Pose = state === "listening"
      ? { headTilt: -0.07, headTurn: 0.03, headNod: 0, leftArm: 0.22, rightArm: -0.22, rightArmPitch: 0 }
      : state === "thinking"
        ? { headTilt: 0.09, headTurn: -0.13, headNod: 0.02, leftArm: 0.12, rightArm: -1.28, rightArmPitch: -0.26 }
        : state === "speaking"
          ? { headTilt: 0, headTurn: 0, headNod: -0.015, leftArm: 0.08, rightArm: -0.8, rightArmPitch: -0.2 }
          : state === "scoring"
            ? { headTilt: 0, headTurn: 0, headNod: 0.11, leftArm: 0.52, rightArm: -0.52, rightArmPitch: 0 }
            : { headTilt: 0, headTurn: 0, headNod: 0, leftArm: 0.08, rightArm: -0.08, rightArmPitch: 0 };

    if (reducedMotionRef.current) {
      Object.assign(poseRef.current, target);
      return;
    }

    gsap.to(poseRef.current, {
      ...target,
      duration: 0.28,
      ease: "power3.out",
      overwrite: "auto",
    });
  }, { dependencies: [state], scope: mountRef, revertOnUpdate: true });

  const expression = state === "listening"
    ? "专注倾听"
    : state === "thinking"
      ? "整理思路"
      : state === "speaking"
        ? "温和提问"
        : state === "scoring"
          ? "记录反馈"
          : "准备就绪";

  return (
    <div className={`virtual-interviewer mentor-state-${state}`} aria-label={`虚拟面试官liuli老师，${expression}`}>
      <div className="mentor-3d-stage" ref={mountRef} />
      <div className="mentor-identity">
        <strong>liuli老师</strong>
        <span>Q版机器猫导师 · 3D 实时形象</span>
      </div>
      <div className="interviewer-label">
        <span className={`indicator state-${state}`} />
        <span>
          {state === "idle" && "随时可以开始"}
          {state === "thinking" && "正在整理下一步问题"}
          {state === "speaking" && "正在和你交流"}
          {state === "listening" && "正在认真倾听"}
          {state === "scoring" && "正在整理面试反馈"}
        </span>
        {ttsSource !== "none" && state === "speaking" && (
          <small className="tts-source-badge">{ttsSource === "tencent" ? "云TTS" : "浏览器"}</small>
        )}
      </div>
    </div>
  );
}
