export type GameMode = 'title' | 'running';

export interface GameState {
  mode: GameMode;
  time: number;
  cameraX: number;
  billyX: number;
  billyY: number;
  velY: number;
  onGround: boolean;
  score: number;
  rings: { x: number; y: number; taken: boolean }[];
}

const GRAVITY = 2200;
const JUMP = -780;
const RUN_SPEED = 420;
const GROUND_Y = 420;

export function createState(): GameState {
  return {
    mode: 'title',
    time: 0,
    cameraX: 0,
    billyX: 120,
    billyY: GROUND_Y,
    velY: 0,
    onGround: true,
    score: 0,
    rings: Array.from({ length: 40 }, (_, i) => ({
      x: 380 + i * 180,
      y: GROUND_Y - (i % 3 === 0 ? 90 : 28),
      taken: false,
    })),
  };
}

export function jump(state: GameState): void {
  if (state.mode !== 'running') return;
  if (!state.onGround) return;
  state.velY = JUMP;
  state.onGround = false;
}

export function startRun(state: GameState): void {
  const next = createState();
  Object.assign(state, next);
  state.mode = 'running';
}

export function step(state: GameState, dt: number): void {
  state.time += dt;
  if (state.mode !== 'running') return;

  state.billyX += RUN_SPEED * dt;
  state.velY += GRAVITY * dt;
  state.billyY += state.velY * dt;

  if (state.billyY >= GROUND_Y) {
    state.billyY = GROUND_Y;
    state.velY = 0;
    state.onGround = true;
  }

  state.cameraX = state.billyX - 140;

  for (const ring of state.rings) {
    if (ring.taken) continue;
    const dx = ring.x - state.billyX;
    const dy = ring.y - (state.billyY - 28);
    if (dx * dx + dy * dy < 38 * 38) {
      ring.taken = true;
      state.score += 10;
    }
  }
}

export { GROUND_Y };
