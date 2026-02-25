// src/scene/sceneConfig.js

// Camera settings
export const CAMERA = {
  fov: 50,                    // Field of view
  near: 0.1,                  // Near clipping plane
  far: 1000,                  // Far clipping plane
  position: {
    x: 0,                     // Camera X position
    y: 3,                     // Camera Y position (height)
    z: 8                      // Camera Z position (distance from center)
  }
};

// Scene settings
export const SCENE = {
  backgroundColor: 0x1a1a1a   // Dark gray background
};

// Light settings
export const LIGHT = {
  color: 0xffffff,            // White light
  intensity: 1.5,             // Brightness
  position: {
    x: 5,                     // Light X position
    y: 5,                     // Light Y position
    z: 5                      // Light Z position
  }
};

// Product (simple cube for now)
export const PRODUCT = {
  size: 2,                    // Cube size
  color: 0x0000ff,            // Blue color
  position: {
    x: 0,                     // Center X
    y: 1,                     // Y position (on ground)
    z: 0                      // Center Z
  }
};

// Floor
export const FLOOR = {
  width: 20,
  height: 20,
  color: 0x808080             // Gray floor
};