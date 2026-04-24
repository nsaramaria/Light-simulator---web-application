let nextId = 0;
const renderers = new Map();
let dirty = true;
let rafId = null;
let running = false;
let continuousCount = 0;

const loop = () => {
  rafId = requestAnimationFrame(loop);

  if (!dirty && continuousCount === 0) return;

  const sorted = [...renderers.values()].sort((a, b) => a.priority - b.priority);
  for (const entry of sorted) {
    try {
      entry.render();
    } catch (e) {
      console.warn('Render error:', e);
    }
  }

  dirty = false;
};

const ensureRunning = () => {
  if (running) return;
  running = true;
  rafId = requestAnimationFrame(loop);
};

const renderLoop = {
  register(renderFn, priority = 0) {
    const id = nextId++;
    renderers.set(id, { render: renderFn, priority });
    ensureRunning();
    dirty = true;
    return id;
  },

  unregister(id) {
    renderers.delete(id);
    if (renderers.size === 0 && rafId) {
      cancelAnimationFrame(rafId);
      running = false;
      rafId = null;
    }
  },

  markDirty() {
    dirty = true;
  },

  enterContinuous() {
    continuousCount++;
    ensureRunning();
  },

  exitContinuous() {
    continuousCount = Math.max(0, continuousCount - 1);
  },

  forceRender() {
    dirty = true;
  },
};

export default renderLoop;