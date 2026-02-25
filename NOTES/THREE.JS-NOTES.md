Create Renderer

const renderer = new THREE.WebGLRenderer({ 
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);

mountRef.current.appendChild(renderer.domElement);

antialias: true:

Smooths jagged edges
Makes lines look cleaner

renderer.setSize(...):

Makes canvas fill entire window
Width = full screen width
Height = full screen height

mountRef.current.appendChild(renderer.domElement):

javascriptmountRef.current
// ↑ The div element (from ref)

.appendChild(renderer.domElement)
//           ↑_________________↑
//           The Three.js canvas