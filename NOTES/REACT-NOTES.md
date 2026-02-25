# React Personal Notes

## Table of Contents

1. [What is React?](#what-is-react)
2. [Components](#components)
3. [Hooks](#hooks)
   - [What are Hooks?](#what-are-hooks)
   - [useState](#usestate)
   - [useEffect](#useeffect)
   - [useRef](#useref)
   - [Hook Rules](#hook-rules)

---

## What is React?

**React = A JavaScript library for building user interfaces**

Created by: Facebook/Meta  
Purpose: Make building interactive UIs easier  
Type: Library (not a framework)

## Components

**Component = Reusable piece of UI (like a LEGO block)**

### Two Types:

#### 1. Functional Components (Modern Way):
```javascript
function MyComponent() {
  return Hello;
}

// Or arrow function:
const MyComponent = () => {
  return Hello;
};
```

#### 2. Class Components (Old Way - Avoid):
```javascript
class MyComponent extends React.Component {
  render() {
    return Hello;
  }
}

```

## Hooks

### What are Hooks?

**Hooks = Special React functions that give functional components superpowers**

#### The Problem Hooks Solve:

Regular functions forget everything:
```javascript
function myFunction() {
  let count = 0;
  count = count + 1;
  // Function ends
  // count is forgotten! 
}
```

React with hooks remembers:
```javascript
function MyComponent() {
  const [count, setCount] = useState(0);
  // React remembers count! 
  // Even when component re-renders!
}
```

### How Hooks Work:

**React has a secret memory storage:**
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

**Hooks connect your function to React's memory!**

---

## useState

**Purpose:** Remember data that can change and trigger re-render

### Basic Syntax:
```javascript
const [value, setValue] = useState(initialValue);
//    ↑       ↑            ↑________↑
//    │       │                 │
//  Current  Function to    React hook
//  value    change it
```

### Example:
```javascript
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    
      Count: {count}
      <button onClick={() => setCount(count + 1)}>
        Increment
      
    
  );
}
```
### How It Works:
```
1. Initial render: count = 0
2. User clicks button
3. setCount(1) called
4. React updates memory: count = 1
5. React re-renders component
6. Component shows new value: 1
```
> Use useState when data changes and you want UI to update automatically

## useEffect

**Purpose:** Run code AFTER component renders (for side effects)

### Basic Syntax:
```javascript
useEffect(() => {
  // Code runs after render
}, [dependencies]);
```

### Example:
```javascript
useEffect(() => {
  console.log("Component rendered!");
  
  // Setup code
  const scene = new THREE.Scene();
  
  // Cleanup (runs when component unmounts)
  return () => {
    console.log("Cleaning up!");
  };
}, []);
```
### Dependency Array Explained:

#### Empty Array `[]` (Run Once):
```javascript
useEffect(() => {
  console.log("Runs ONCE on mount");
}, []);
```

**Runs:**
- ✅ Once when component first appears
- ❌ Never again

**Use for:** Three.js setup, data fetching, one-time setup

---

#### No Array (Run Every Render):
```javascript
useEffect(() => {
  console.log("Runs on EVERY render");
});
// No dependency array
```

**Runs:**
- ✅ On first render
- ✅ Every time component updates
- ⚠️ Can cause performance issues!

**Rarely used!**

---

#### With Dependencies (Run When Values Change):
```javascript
const [count, setCount] = useState(0);

useEffect(() => {
  console.log("Count changed to:", count);
}, [count]);
//  ↑____↑
//  Runs when count changes
```

**Runs:**
- ✅ On first render
- ✅ When `count` changes
- ❌ Not when other things change

---