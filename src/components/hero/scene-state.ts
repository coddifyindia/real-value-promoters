// Shared, mutable state between the DOM (scroll, pointer) and the WebGL render
// loop. Kept outside React on purpose: these values change every frame and must
// not trigger re-renders.
export const sceneState = {
  /** 0 → 1 as the visitor scrolls through the pinned hero (desktop). */
  progress: 0,
  /** Pointer position in -1..1, for gentle parallax. */
  pointer: { x: 0, y: 0 },
  /** Phones: no pinned scroll, so the story plays on a timer instead. */
  autoplay: false,
};
