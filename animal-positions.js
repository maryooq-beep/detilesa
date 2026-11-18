/**
 * Source of truth for animal placement on the 3024 × 3326 tree canvas.
 * All positions and visual offsets are percentages of the tree canvas.
 * Edit through ?calibrate=1 or directly in this file.
 */
window.ANIMAL_POSITION_CONFIG = {
  version: 1,
  coordinateSystem: { width: 3024, height: 3326, unit: "percent" },
  animals: {
    fox: {
      x: 12.753, y: 26.1956, baseSize: 31, scale: 1.2, rotation: 0,
      visualOffsetX: 0, visualOffsetY: 0,
      hitbox: { x: 8, y: 12, width: 84, height: 76 }
    },
    heron: {
      x: 47.9969, y: 18.0893, baseSize: 29, scale: 0.8, rotation: 0,
      visualOffsetX: 0, visualOffsetY: 0,
      hitbox: { x: 12, y: 8, width: 76, height: 84 }
    },
    moose: {
      x: 5.1784, y: 47.096, baseSize: 48, scale: 1, rotation: 0,
      visualOffsetX: 0, visualOffsetY: 0,
      hitbox: { x: 8, y: 14, width: 84, height: 72 }
    },
    roe: {
      x: 31.0599, y: 44.7436, baseSize: 36, scale: 1.72, rotation: 0,
      visualOffsetX: 0, visualOffsetY: 0,
      hitbox: { x: 17, y: 7, width: 66, height: 88 }
    },
    tit: {
      x: 37.131, y: 12.132, baseSize: 17, scale: 0.8, rotation: 0,
      visualOffsetX: 0, visualOffsetY: 0,
      hitbox: { x: 18, y: 18, width: 64, height: 64 }
    }
  }
};
