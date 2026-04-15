# React Personal Notes

## Table of Contents

1. [What is React?](#what-is-react)
2. [Components](#components)
3. [JSX](#jsx)
4. [Props](#props)
5. [Hooks](#hooks)
   - [What are Hooks?](#what-are-hooks)
   - [useState](#usestate)
   - [useEffect](#useeffect)
   - [useRef](#useref)
   - [useCallback](#usecallback)
   - [Hook Rules](#hook-rules)
6. [Conditional Rendering](#conditional-rendering)
7. [Event Handling](#event-handling)
8. [Component Lifecycle (Mount, Update, Unmount)](#component-lifecycle)
9. [Styled-Components](#styled-components)
10. [Project Architecture (How My Components Talk)](#project-architecture)

---

## What is React?

**React = A JavaScript library for building user interfaces**

Created by: Facebook/Meta  
Purpose: Make building interactive UIs easier  
Type: Library (not a framework)

---

## Components

**Component = Reusable piece of UI (like a LEGO block)**

### Two Types:

#### 1. Functional Components (Modern Way - What I Use):
```javascript
function MyComponent() {
  return <div>Hello</div>;
}

// Or arrow function:
const MyComponent = () => {
  return <div>Hello</div>;
};
```

#### 2. Class Components (Old Way - Avoid):
```javascript
class MyComponent extends React.Component {
  render() {
    return <div>Hello</div>;
  }
}
```

### My Components:
```
App.jsx              — Main layout, dual view, auth check
├── Auth.jsx         — Login/register screen
├── Header.jsx       — Top bar with Add menu, help, logout
│   └── AddMenu.jsx  — Dropdown to add lights/objects to scene
├── CameraView.jsx   — Three.js renderer showing photographer's perspective
├── SetupView.jsx    — Three.js renderer with gizmos, raycasting, orbit controls
├── SelectionPanel   — Sidebar showing properties of selected object
├── ContextMenu.jsx  — Right-click delete menu
└── HelpModal.jsx    — How-to-use popup
```

---

## JSX

JSX = HTML-like syntax that React uses inside JavaScript. It looks like HTML but it's actually JavaScript function calls underneath.

```javascript
// JSX
const element = <h1 className="title">Hello</h1>;

// What React actually sees (you never write this)
const element = React.createElement('h1', { className: 'title' }, 'Hello');
```

Key differences from HTML:
- `className` instead of `class` (class is reserved in JS)
- `onClick` instead of `onclick` (camelCase)
- Must close all tags: `<img />` not `<img>`
- Can embed JS expressions with `{}`

```javascript
return (
  <div>
    <h1>{user.name}</h1>
    <p>{isLoggedIn ? 'Welcome' : 'Please log in'}</p>
    <button onClick={() => setCount(count + 1)}>Click</button>
  </div>
);
```

---

## Props

Props = data passed from a parent component to a child component. Like function parameters.

```javascript
// Parent passes props
<Header onAdd={handleAdd} onShowHelp={() => setShowHelp(true)} user={user} onLogout={handleLogout} />

// Child receives props
export default function Header({ onAdd, onShowHelp, user, onLogout }) {
  return (
    <HeaderBar>
      <AddMenu onAdd={onAdd} />
      {user && <UserEmail>{user.email}</UserEmail>}
      {user && <LogoutBtn onClick={onLogout}>Log out</LogoutBtn>}
    </HeaderBar>
  );
}
```

> Props flow ONE way: parent → child. Child cannot change parent's data. To communicate back, parent passes a callback function as a prop.

---

## Hooks

### What are Hooks?

**Hooks = Special React functions that give functional components superpowers**

React has a secret memory storage. Hooks connect your function to it:
```
┌─────────────────────────────────────┐
│  YOUR COMPONENT (Function)          │
│  function MyComponent() { ... }     │
└──────────────┬──────────────────────┘
               │ uses
               ↓
┌─────────────────────────────────────┐
│  REACT'S MEMORY STORAGE             │
├─────────────────────────────────────┤
│  MyComponent_state: 5               │ ← useState
│  MyComponent_ref: { current: <div> }│ ← useRef
│  MyComponent_effects: [...]         │ ← useEffect
└─────────────────────────────────────┘
```

---

### useState

**Purpose:** Remember data that can change and trigger re-render

```javascript
const [value, setValue] = useState(initialValue);
```

Examples from my project:
```javascript
const [open, setOpen] = useState(false);           // AddMenu open/closed
const [activeCat, setActiveCat] = useState('lights'); // Which category is hovered
const [selected, setSelected] = useState(null);     // Which object is selected
const [collapsed, setCollapsed] = useState(false);  // Sidebar collapsed
const [splitPct, setSplitPct] = useState(50);       // Divider position
const [dragging, setDragging] = useState(false);    // Is divider being dragged
const [maximized, setMaximized] = useState(null);   // Which panel is maximized
```

How it works:
```
1. Initial render: open = false
2. User clicks button
3. setOpen(true) called
4. React updates memory: open = true
5. React RE-RENDERS component
6. Component shows new value
```

### Lazy initialization (from App.jsx):
```javascript
const [user, setUser] = useState(() => {
  const saved = localStorage.getItem('user');
  return saved ? JSON.parse(saved) : null;
});
```
Passing a function to useState means it only runs on the first render, not on every re-render. Good for expensive operations like reading from localStorage.

---

### useEffect

**Purpose:** Run code AFTER component renders (for side effects)

```javascript
useEffect(() => {
  // Setup code runs after render
  
  return () => {
    // Cleanup code runs when component unmounts
  };
}, [dependencies]);
```

### Dependency Array:

**Empty `[]` — Run once on mount:**
```javascript
useEffect(() => {
  // Three.js setup, event listeners, etc.
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  
  return () => {
    renderer.dispose();  // Cleanup on unmount
  };
}, []);
```
This is how I set up Three.js in CameraView and SetupView. Runs once when the component appears, cleanup runs when it disappears.

**No array — Run every render:** (rarely used, can cause performance issues)

**With dependencies — Run when values change:**
```javascript
useEffect(() => {
  console.log("Count changed to:", count);
}, [count]);
```

### Cleanup is critical in my project:

Without cleanup, I get duplicate canvases, stacked event listeners, and memory leaks:
```javascript
return () => {
  cancelAnimationFrame(rafId);      // Stop the render loop
  unsub();                          // Remove scene change listener
  ro.disconnect();                  // Stop ResizeObserver
  window.removeEventListener('resize', onResize);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('studio:select', onExternalSelect);
  container.removeEventListener('pointerdown', onPointerDown);
  // ... etc
  renderer.dispose();               // Free GPU resources
  destroySharedScene();             // Dispose all scene objects
};
```

---

### useRef

**Purpose:** Hold a reference to a DOM element or any mutable value that doesn't trigger re-render when changed.

```javascript
const mountRef = useRef(null);
```

Two uses:

**1. DOM element reference (so Three.js knows where to put the canvas):**
```javascript
const mountRef = useRef(null);

useEffect(() => {
  const container = mountRef.current;  // The actual DOM element
  container.appendChild(renderer.domElement);
}, []);

return <Mount ref={mountRef} />;
```

**2. Mutable value that survives re-renders (used in AddMenu):**
```javascript
const wrapperRef = useRef(null);

useEffect(() => {
  const handler = (e) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
      setOpen(false);  // Close menu when clicking outside
    }
  };
  document.addEventListener('mousedown', handler);
  return () => document.removeEventListener('mousedown', handler);
}, []);
```

---

### useCallback

**Purpose:** Memoize a function so it doesn't get recreated on every render. Useful when passing callbacks to child components or event handlers.

```javascript
const onDividerMouseDown = useCallback((e) => {
  e.preventDefault();
  setDragging(true);
  // ... mouse move/up handlers
}, []);
```

The empty `[]` means this function is created once and reused. Without useCallback, it would be recreated on every render.

---

### Hook Rules

1. Only call hooks at the top level (not inside loops, conditions, or nested functions)
2. Only call hooks from React function components or custom hooks
3. Hooks must be called in the same order every render

```javascript
// ❌ WRONG
if (condition) {
  const [value, setValue] = useState(0);
}

// ✅ CORRECT
const [value, setValue] = useState(0);
if (condition) {
  // use value here
}
```

---

## Conditional Rendering

Show different things based on state:

```javascript
// Early return - show login screen if not logged in
if (!user) {
  return <Auth onLogin={setUser} />;
}

// Inline with && (show only if truthy)
{user && <UserEmail>{user.email}</UserEmail>}
{error && <ErrorMsg>{error}</ErrorMsg>}

// Ternary for either/or
{isRegister ? 'Create Account' : 'Welcome Back'}
{maximized === 'camera' ? '⤡' : '⤢'}

// Hide component entirely
{showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
```

---

## Event Handling

React uses camelCase event names and passes functions (not strings):

```javascript
// React (correct)
<button onClick={() => handleAdd(item.id)}>Add</button>
<input onChange={e => setEmail(e.target.value)} />
<input onBlur={() => setTouched(t => ({ ...t, email: true }))} />
<input onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }} />

// HTML (don't mix these up)
<button onclick="handleAdd()">Add</button>
```

The `e` parameter is a synthetic event object (React's wrapper around the native browser event). Access `e.target.value` for input values.

---

## Component Lifecycle

Every React component goes through:

1. **Mount** — Component appears in the DOM → `useEffect(() => { ... }, [])` runs
2. **Update** — State or props change → component re-renders → `useEffect` with dependencies runs
3. **Unmount** — Component is removed from DOM → `useEffect` cleanup function runs

```
Mount:    useEffect setup → Three.js renderer created, event listeners added
Update:   Scene changes → onSceneChange callbacks fire → proxies sync
Unmount:  useEffect cleanup → renderer disposed, listeners removed, scene destroyed
```

This is why cleanup is so important — without it, removing a component leaves behind orphaned renderers and event listeners.

---

## Styled-Components

A CSS-in-JS library. Instead of separate CSS files, you write CSS inside JavaScript.

```javascript
import styled from 'styled-components';

const Button = styled.button`
  background: #d4a574;
  border: none;
  padding: 12px;
  cursor: pointer;

  &:hover {
    background: #c99564;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Use like a React component
<Button onClick={handleClick}>Click me</Button>
```

### Dynamic styling with props:
```javascript
const ViewPanel = styled.div`
  width: ${({ $width }) => $width}%;
  display: ${({ $width }) => $width === 0 ? 'none' : 'block'};
`;

// The $ prefix is a styled-components convention
// It means "this prop is for styling only, don't pass to DOM"
<ViewPanel $width={cameraWidth} />
```

### Shared theme:
```javascript
// styles/theme.js
export const colors = {
  accent:    '#d4a574',
  border:    '#3d3530',
  text:      '#e8dfd6',
  // ...
};

// Used in any styled component
const Title = styled.h1`
  color: ${colors.text};
`;
```

> I migrated from inline styles and plain CSS to styled-components for cleaner, more maintainable code. Each component owns its styles.

---

## Project Architecture

### How My Components Talk:

**Parent → Child:** Props
```
App passes onAdd to Header → Header passes it to AddMenu
```

**Child → Parent:** Callback functions passed as props
```
Auth calls onLogin(user) → App receives the user and updates state
```

**Siblings (no parent-child relationship):** CustomEvent on window
```
SetupView fires 'studio:select' → SelectionPanel listens and updates
ContextMenu fires 'studio:delete-element' → SetupView listens and removes
```

I chose the CustomEvent approach because restructuring the entire React tree just to use Context or props would have been too invasive. Any component can fire or listen without knowing about the others. The tradeoff is I have to make sure every listener gets removed in the cleanup.