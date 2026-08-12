import { APP_VERSION } from './version';
import {
  createState,
  GROUND_Y,
  jump,
  startRun,
  step,
  type GameState,
} from './game';

function requireEl<T extends Element>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Missing ${selector}`);
  return el;
}

const canvas = requireEl<HTMLCanvasElement>('#game');
const startBtn = requireEl<HTMLButtonElement>('#start');
const titleCard = requireEl<HTMLDivElement>('#title-card');
const playHud = requireEl<HTMLDivElement>('#play-hud');
const scoreEl = requireEl<HTMLSpanElement>('#score');
const versionEl = requireEl<HTMLSpanElement>('#version');

versionEl.textContent = APP_VERSION;

const ctxOrNull = canvas.getContext('2d');
if (!ctxOrNull) throw new Error('Canvas 2D unavailable');
const ctx: CanvasRenderingContext2D = ctxOrNull;

const state: GameState = createState();
let last = performance.now();

function resize(): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function tryJump(): void {
  if (state.mode === 'title') {
    begin();
    return;
  }
  jump(state);
}

function begin(): void {
  startRun(state);
  titleCard.hidden = true;
  playHud.hidden = false;
}

startBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  begin();
});
window.addEventListener('pointerdown', tryJump);
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' || event.code === 'ArrowUp') {
    event.preventDefault();
    tryJump();
  }
});
window.addEventListener('resize', resize);

function drawSky(width: number, height: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, '#4aa3ff');
  g.addColorStop(1, '#b8e4ff');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
}

function drawHills(width: number, height: number, cam: number): void {
  ctx.fillStyle = '#3cb46a';
  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let x = 0; x <= width; x += 8) {
    const wx = x + cam * 0.35;
    const y = height * 0.62 + Math.sin(wx / 90) * 28 + Math.sin(wx / 37) * 12;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#2e8b57';
  ctx.fillRect(0, GROUND_Y + 8, width, height);
}

function drawRing(x: number, y: number, t: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(t * 6) * 0.15);
  ctx.strokeStyle = '#ffd24a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(0, 0, 12, 16, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawBilly(x: number, y: number, t: number, airborne: boolean): void {
  const bob = airborne ? 0 : Math.sin(t * 18) * 3;
  ctx.save();
  ctx.translate(x, y + bob);

  ctx.fillStyle = '#c47a32';
  ctx.beginPath();
  ctx.ellipse(0, -22, 22, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(18, -36, 14, 12, 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#8a4b1f';
  ctx.beginPath();
  ctx.ellipse(10, -48, 8, 12, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(24, -46, 7, 11, 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(22, -38, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(23, -38, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ff6b8a';
  ctx.beginPath();
  ctx.ellipse(30, -30, 6, 3, 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#8a4b1f';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  const leg = airborne ? -8 : Math.sin(t * 18) * 10;
  ctx.beginPath();
  ctx.moveTo(-10, -8);
  ctx.lineTo(-14, 6 + leg);
  ctx.moveTo(6, -8);
  ctx.lineTo(12, 6 - leg);
  ctx.stroke();

  ctx.restore();
}

function frame(now: number): void {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  step(state, dt);

  const width = window.innerWidth;
  const height = window.innerHeight;
  drawSky(width, height);
  drawHills(width, height, state.cameraX);

  for (const ring of state.rings) {
    if (ring.taken) continue;
    const sx = ring.x - state.cameraX;
    if (sx < -40 || sx > width + 40) continue;
    drawRing(sx, ring.y, state.time);
  }

  drawBilly(state.billyX - state.cameraX, state.billyY, state.time, !state.onGround);
  scoreEl.textContent = String(state.score);

  requestAnimationFrame(frame);
}

resize();
requestAnimationFrame(frame);
