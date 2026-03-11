// src/scene/sceneConfig.js

// Camera settings
export const CAMERA = {
  fov: 50,                  
  near: 0.1,                 
  far: 1000,                 
  position: {
    x: 0,                    
    y: 3,                     
    z: 8                      
  }
};

// Scene settings
export const SCENE = {
  backgroundColor: 0x1a1a1a   // dark gray background
};

// Light settings
export const LIGHT = {
  color: 0xffffff,            // white light
  intensity: 1.5,            
  position: {
    x: 5,                    
    y: 5,                    
    z: 5                     
  }
};

// Product (simple cube for now)
export const PRODUCT = {
  size: 2,                   
  color: 0xd4a5a5,            // pink
  position: {
    x: 0,                    
    y: 1,                     
    z: 0                      
  }
};

// Floor
export const FLOOR = {
  width: 20,
  height: 20,
  color: 0x8b7d6b           // brown
};