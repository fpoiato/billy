import { describe, expect, it } from 'vitest';
import { createState, jump, startRun, step } from './game';

describe('game', () => {
  it('starts on the title screen', () => {
    expect(createState().mode).toBe('title');
  });

  it('runs forward and collects a nearby ring after start', () => {
    const state = createState();
    startRun(state);
    state.rings[0].x = state.billyX + 10;
    state.rings[0].y = state.billyY - 28;
    step(state, 0.05);
    expect(state.mode).toBe('running');
    expect(state.billyX).toBeGreaterThan(120);
    expect(state.score).toBe(10);
  });

  it('jumps only while running on the ground', () => {
    const title = createState();
    jump(title);
    expect(title.onGround).toBe(true);

    const running = createState();
    startRun(running);
    jump(running);
    expect(running.onGround).toBe(false);
    expect(running.velY).toBeLessThan(0);
  });
});
