import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/motion.js";

/**
 * QuantumFieldGL — the hero's energy field, as a real GPU shader.
 *
 * A domain-warped fbm "light fog" flows violet→cyan across the hero.
 * Pointer movement seeds genuine travelling waves (a ring buffer of wave
 * sources evaluated in the fragment shader — the ripples are physics, not
 * sprites), and a click fires a stronger "measurement collapse" pulse that
 * also notifies the headline (CustomEvent "qf-collapse").
 *
 * Progressive enhancement contract:
 * - WebGL unavailable / shader compile failure / reduced motion → calls
 *   onFallback() and the app mounts the Canvas 2D field + CSS nebula.
 * - FPS sentinel: samples real frame times for the first ~90 visible
 *   frames; if p95 exceeds 24ms the GPU can't hold 60fps → onFallback().
 * - Pauses (and clears) past the hero and while the tab is hidden — same
 *   discipline as the Canvas field it replaces.
 *
 * Renders at 0.7× DPR-capped resolution: the fog is inherently soft, so
 * the upscale is invisible and the fill-rate budget drops ~2×.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5); // y: 0 = top
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseAmp;
uniform vec4 uRipples[4]; // xy = uv origin, z = birth time, w = strength

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

// 3 octaves — integrated-GPU budget. The fog is low-frequency; the
// fourth octave was invisible detail at 2x the ALU cost.
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(19.7, 7.3);
    a *= 0.55;
  }
  return v;
}

void main() {
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  vec2 p = vUv * asp * 2.3;

  // Travelling waves from the ripple ring buffer. Each source emits an
  // expanding ring (gaussian-profiled wavefront) that decays with age and
  // *displaces the fog's domain* — the fog genuinely sloshes.
  float glow = 0.0;
  vec2 disp = vec2(0.0);
  for (int i = 0; i < 4; i++) {
    vec4 r = uRipples[i];
    float age = uTime - r.z;
    float on = step(0.001, r.w) * step(0.0, age) * step(age, 2.5);
    vec2 d = (vUv - r.xy) * asp;
    float dist = length(d) + 1e-5;
    float front = dist - age * 0.38;
    float ring = exp(-front * front * 110.0);
    float decay = exp(-age * 1.7) * r.w * on;
    glow += ring * decay;
    disp += (d / dist) * ring * decay * 0.05;
  }

  // Single-stage domain-warped fbm — the flowing energy fog. The second
  // warp stage doubled the noise budget for marginal shape gain.
  vec2 q = vec2(fbm(p + uTime * 0.055), fbm(p + vec2(5.2, 1.3) - uTime * 0.045));
  float f = fbm(p + 2.7 * q + disp * 9.0);

  // Brand pair on the violet-ink floor — violet leads, cyan only ignites
  // at the energy peaks (it's the accent, not the wash).
  vec3 violet = vec3(0.30, 0.19, 0.78);
  vec3 cyan = vec3(0.10, 0.52, 0.68);
  vec3 col = mix(violet, cyan, smoothstep(0.62, 1.05, f + 0.25 * q.x));

  // Observation aura around the cursor.
  vec2 md = (vUv - uMouse) * asp;
  float aura = exp(-dot(md, md) * 10.0) * uMouseAmp;

  // pow() carves dark voids between the fog filaments — wisps, not a wash.
  float lum = pow(f, 2.8) * 0.55 + glow * 0.7 + aura * 0.3;
  // Fade toward the bottom so the field dissolves before the fold, and
  // ease off under the left column so the copy always wins.
  lum *= mix(1.0, 0.22, smoothstep(0.30, 1.0, vUv.y));
  lum *= mix(0.45, 1.0, smoothstep(0.15, 0.75, vUv.x));

  vec3 rgb = col * lum + vec3(0.75, 0.85, 1.0) * glow * 0.08;
  float alpha = clamp(lum, 0.0, 0.34);
  gl_FragColor = vec4(rgb * 0.9, alpha); // premultiplied over the ink grid
}
`;

const MAX_RIPPLES = 4;

const QuantumFieldGL = ({ onFallback }) => {
    const canvasRef = useRef(null);
    const fallbackRef = useRef(onFallback);
    fallbackRef.current = onFallback;

    useEffect(() => {
        const bail = () => fallbackRef.current?.();

        if (prefersReducedMotion()) { bail(); return undefined; }
        const canvas = canvasRef.current;
        if (!canvas) return undefined;

        const gl =
            canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false }) ||
            canvas.getContext("experimental-webgl", { alpha: true, premultipliedAlpha: true });
        if (!gl) { bail(); return undefined; }

        const compile = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
            return s;
        };
        const vs = compile(gl.VERTEX_SHADER, VERT);
        const fs = compile(gl.FRAGMENT_SHADER, FRAG);
        if (!vs || !fs) { bail(); return undefined; }
        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { bail(); return undefined; }
        gl.useProgram(prog);

        // Fullscreen triangle
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, "aPos");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

        const U = {
            res: gl.getUniformLocation(prog, "uRes"),
            time: gl.getUniformLocation(prog, "uTime"),
            mouse: gl.getUniformLocation(prog, "uMouse"),
            mouseAmp: gl.getUniformLocation(prog, "uMouseAmp"),
            ripples: gl.getUniformLocation(prog, "uRipples"),
        };

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // premultiplied

        // The fog is soft — render at a fraction of the display resolution
        // and let CSS upscale. `scale` can step down once if the FPS
        // audition fails before we give up on the GPU entirely.
        let scale = 0.5;
        let width = 0;
        let height = 0;
        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * scale;
            canvas.width = Math.max(1, Math.floor(width * dpr));
            canvas.height = Math.max(1, Math.floor(height * dpr));
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        // Wave sources — ring buffer uploaded as a flat vec4 array.
        const ripples = new Float32Array(MAX_RIPPLES * 4);
        let rippleIdx = 0;
        const t0 = performance.now();
        const now = () => (performance.now() - t0) / 1000;
        const addRipple = (clientX, clientY, strength) => {
            const o = rippleIdx * 4;
            ripples[o] = clientX / width;
            ripples[o + 1] = clientY / height;
            ripples[o + 2] = now();
            ripples[o + 3] = strength;
            rippleIdx = (rippleIdx + 1) % MAX_RIPPLES;
        };

        const mouse = { x: 0.5, y: 0.35, amp: 0 };
        let lastTrail = 0;
        let lastX = -1;
        let lastY = -1;
        const onMove = (e) => {
            mouse.x = e.clientX / width;
            mouse.y = e.clientY / height;
            mouse.amp = Math.min(1, mouse.amp + 0.08);
            const t = performance.now();
            const moved = Math.hypot(e.clientX - lastX, e.clientY - lastY);
            if (t - lastTrail > 110 && moved > 36 && e.clientY < height) {
                lastTrail = t;
                lastX = e.clientX;
                lastY = e.clientY;
                addRipple(e.clientX, e.clientY, 0.30);
            }
        };
        // Click inside the hero = measurement collapse: strong pulse in the
        // field, and the headline gets a sympathetic jolt.
        const onClick = (e) => {
            if (e.clientY > height) return;
            if (window.scrollY > height * 0.6) return;
            addRipple(e.clientX, e.clientY, 1.0);
            window.dispatchEvent(new CustomEvent("qf-collapse"));
        };

        let raf = 0;
        let running = true;

        // FPS sentinel — two-step ladder. A failed audition first drops the
        // render scale (cheaper fill, same fog) and re-auditions; only a
        // second failure falls back to the Canvas 2D field. Smoothness is
        // the hard line; the effect degrades before it disappears.
        let samples = [];
        let lastFrame = 0;
        let judged = false;
        let demoted = false;
        const judge = () => {
            const sorted = [...samples].sort((a, b) => a - b);
            const p95 = sorted[Math.floor(sorted.length * 0.95)];
            if (p95 <= 24) { judged = true; return; }
            if (!demoted) {
                demoted = true;
                scale = 0.4;
                resize();
                samples = [];
                lastFrame = 0;
                return; // re-audition at the lower scale
            }
            cleanup();
            bail();
        };

        const step = (ts) => {
            if (!judged && !document.hidden) {
                if (lastFrame) {
                    const d = ts - lastFrame;
                    if (d < 250) samples.push(d); // ignore tab-switch gaps
                    if (samples.length >= 90) judge();
                }
                lastFrame = ts;
            }
            mouse.amp *= 0.94;
            gl.uniform2f(U.res, width, height);
            gl.uniform1f(U.time, now());
            gl.uniform2f(U.mouse, mouse.x, mouse.y);
            gl.uniform1f(U.mouseAmp, mouse.amp);
            gl.uniform4fv(U.ripples, ripples);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            if (running) raf = requestAnimationFrame(step);
        };

        const shouldRun = () => !document.hidden && window.scrollY < window.innerHeight * 0.95;
        const sync = () => {
            const next = shouldRun();
            if (next && !running) { running = true; lastFrame = 0; raf = requestAnimationFrame(step); }
            else if (!next && running) {
                running = false;
                cancelAnimationFrame(raf);
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
        };

        // Escape hatch: lets tests (and emergencies) force the 2D fallback.
        const onForce = () => { cleanup(); bail(); };

        let cleaned = false;
        const cleanup = () => {
            if (cleaned) return;
            cleaned = true;
            cancelAnimationFrame(raf);
            running = false;
            window.removeEventListener("resize", resize);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("click", onClick);
            window.removeEventListener("scroll", sync);
            window.removeEventListener("qf-force-fallback", onForce);
            document.removeEventListener("visibilitychange", sync);
            const ext = gl.getExtension("WEBGL_lose_context");
            ext?.loseContext();
        };

        resize();
        raf = requestAnimationFrame(step);
        window.addEventListener("resize", resize, { passive: true });
        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("click", onClick, { passive: true });
        window.addEventListener("scroll", sync, { passive: true });
        window.addEventListener("qf-force-fallback", onForce);
        document.addEventListener("visibilitychange", sync);

        return cleanup;
    }, []);

    return (
        <canvas
            ref={canvasRef}
            data-quantum-gl
            aria-hidden="true"
            style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
        />
    );
};

export default QuantumFieldGL;
