# JavaScript Personal Notes

My learning notes for JavaScript concepts used in this project

## Table of Contents

1. [Variables](#variables)
2. [Data Types](#data-types)
3. [Functions](#functions)
4. [Arrow Functions](#arrow-functions)
5. [Destructuring](#destructuring)
6. [Template Literals](#template-literals)
7. [Spread Operator](#spread-operator)
8. [ES Modules vs CommonJS](#es-modules-vs-commonjs)
9. [Promises and async/await](#promises-and-asyncawait)
10. [Closures](#closures)
11. [The Set Data Structure](#the-set-data-structure)
12. [Array Methods (map, filter, forEach, find, entries)](#array-methods)
13. [Ternary Operator](#ternary-operator)
14. [Optional Chaining](#optional-chaining)
15. [Nullish Coalescing](#nullish-coalescing)
16. [localStorage](#localstorage)
17. [Regular Expressions](#regular-expressions)
18. [Event System (CustomEvent + dispatchEvent)](#event-system)
19. [JSON](#json)
20. [try/catch for Error Handling](#trycatch-for-error-handling)

---

## Variables

### Three Types:
```javascript
// const - Cannot change (use 95% of the time)
const name = "Nicole";

// let - Can change
let age = 25;
age = 26; // OK

// var - OLD WAY, don't use
var oldWay = "avoid";
```

> Always use `const` unless I know the value will change, then use `let`

---

## Data Types

### Strings
```javascript
const name = "Nicole";
const greeting = `Hello ${name}!`;  // Template literal

// String methods I use:
name.length              // 6
name.toUpperCase()       // "NICOLE"
name.toLowerCase()       // "nicole"
```

### Arrays (Lists)
```javascript
const colors = ["red", "green", "blue"];

// Array methods I use:
colors.length           // 3
colors.push("yellow")   // Add to end
colors.pop()           // Remove from end
```

### Objects (Grouped Data)
```javascript
const person = {
  name: "Nicole",
  age: 25,
  city: "Craiova"
};

// Access properties:
person.name      // "Nicole"
person["age"]    // 25

// Change property:
person.age = 26;
```

---

## Functions

### Function Declaration
```javascript
function sayHello() {
  console.log("Hello!");
}
sayHello();  // Call it
```

### Function with Parameters
```javascript
function greet(name) {
  console.log(`Hello ${name}!`);
}
greet("Nicole");  // Hello Nicole!
```

### Function with Return
```javascript
function add(a, b) {
  return a + b;
}
const result = add(5, 3);  // 8
```

---

## Arrow Functions

Shorter way to write functions. The important difference: arrow functions don't have their own `this`, they capture it from the surrounding scope. In C++ you'd capture by reference in a lambda, here it just happens automatically.

```javascript
// Regular function
function add(a, b) { return a + b; }

// Arrow function (same thing)
const add = (a, b) => a + b;

// Arrow function with body (when you need multiple lines)
const greet = (name) => {
  const message = `Hello ${name}`;
  return message;
};
```

Used everywhere in this project: event handlers, `.forEach()`, `.map()`, `.filter()`, cleanup functions.

```javascript
// Example from sharedScene.js - listener cleanup
export const onSceneChange = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);  // arrow function returned for cleanup
};
```

---

## Destructuring

Pulling values out of objects and arrays into variables. Purely syntax sugar, doesn't exist in C++.

```javascript
// Object destructuring
const { email, password } = req.body;
// Same as:
// const email = req.body.email;
// const password = req.body.password;

// Array destructuring (used with React hooks)
const [open, setOpen] = useState(false);
// Same as:
// const arr = useState(false);
// const open = arr[0];
// const setOpen = arr[1];

// Nested destructuring
const { scene, elementMeshes } = createSharedScene();

// Destructuring with rename
const { x: posX } = position;
```

---

## Template Literals

Backtick strings with embedded expressions. Like string formatting in C++ but built into the syntax.

```javascript
const PORT = 3001;
console.log(`Server running on http://localhost:${PORT}`);

// Can have expressions inside ${}
console.log(`Total: ${price * quantity}`);

// Multi-line strings (no escape characters needed)
const html = `
  <div>
    <h1>Hello</h1>
  </div>
`;
```

---

## Spread Operator

The `...` copies all properties from one object/array into a new one.

```javascript
// Object spread - copy and override
const oldState = { x: 1, y: 2, z: 3 };
const newState = { ...oldState, x: 5 };
// newState = { x: 5, y: 2, z: 3 }

// Array spread
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];  // [1, 2, 3, 4, 5]
```

Used a lot in React for state updates:
```javascript
setTouched(t => ({ ...t, email: true }));
// Copies all existing touched values, then overrides email to true
```

> Important: spread creates a SHALLOW copy. Nested objects still share references.

---

## ES Modules vs CommonJS

JavaScript has two module systems. Each file is its own module with its own scope, nothing leaks out unless explicitly exported.

### ES Modules (Frontend - Vite uses these)
```javascript
// Exporting
export const colors = { accent: '#d4a574' };
export default function App() { }

// Importing
import { colors } from '../styles/theme';
import App from './App';
```

### CommonJS (Backend - Node.js traditional)
```javascript
// Exporting
module.exports = router;
module.exports = { getPool, sql };

// Importing
const express = require('express');
const { getPool, sql } = require('../db');
```

The `"type": "commonjs"` in backend's `package.json` tells Node to use CommonJS. The frontend uses ES Modules because Vite expects them.

Unlike C++ `#include` (which copies text), ES imports create **live bindings**. If the exporting module changes a value, the importing module sees the change. This is why `sceneState` in `sharedScene.js` works: every file that imports it sees the same object.

---

## Promises and async/await

JavaScript is single-threaded but uses asynchronous operations for network requests, file I/O, and timers. Instead of blocking (like C++ does by default), these return a **Promise** — an object representing a value that will exist in the future.

```javascript
// Promise chain (older way)
fetch(url).then(response => response.json()).then(data => console.log(data));

// async/await (cleaner syntax, same thing underneath)
const response = await fetch(url);
const data = await response.json();
```

`async` marks a function as asynchronous. `await` pauses execution until the Promise resolves. Error handling uses `try/catch`.

### In my backend - every database query is async:
```javascript
router.post('/login', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id, email, password FROM users WHERE email = @email');
    // ... rest of login logic
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

### In my frontend API helper:
```javascript
const request = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, { ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
};
```

---

## Closures

When a function is defined inside another function, it retains access to the outer function's variables even after the outer function has finished executing.

```javascript
// From sharedScene.js
export const onSceneChange = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
  //     ↑ This returned function "closes over" fn and listeners
  //       It remembers which fn was added so it can remove the right one
};
```

In C++ you'd do this with captured lambda variables. In JS it happens naturally with any nested function.

### Another example - the auth middleware:
```javascript
const auth = (req, res, next) => {
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attaches user info to request
    next();              // Passes to the next handler
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## The Set Data Structure

```javascript
const listeners = new Set();
```

A Set stores unique values. Used for the observer/listener system in `sharedScene.js`:
- `.add(fn)` won't duplicate if the same function is added twice
- `.delete(fn)` removes by value
- `.forEach()` iterates all entries

Similar to `std::unordered_set` in C++ but stores any type.

---

## Array Methods

Methods I use constantly in this project:

```javascript
// .map() - Transform each element, return new array
const names = users.map(user => user.name);

// .filter() - Keep elements that pass a test
const adults = users.filter(user => user.age >= 18);

// .forEach() - Do something for each element (no return)
listeners.forEach(fn => fn());

// .find() - Get first element that matches
const cat = CATEGORIES.find(c => c.id === activeCat);

// Object.entries() - Convert object to array of [key, value] pairs
Object.entries(proxies).forEach(([id, proxy]) => {
  // id = "light-0", proxy = the Three.js group
});

// Object.values() - Get array of all values
Object.values(proxies).forEach(proxy => { ... });
```

---

## Ternary Operator

Inline if/else. Used heavily in styled-components:

```javascript
// condition ? valueIfTrue : valueIfFalse
const color = isActive ? '#d4a574' : '#9b8a7a';

// In styled-components
background: ${({ $active }) => $active ? 'rgba(212,165,116,0.2)' : 'transparent'};
```

---

## Optional Chaining

Safely access nested properties without crashing if something is null/undefined:

```javascript
// Without optional chaining (crashes if elements[id] is undefined)
const type = sceneState.elements[id].type;

// With optional chaining (returns undefined instead of crashing)
const type = sceneState.elements[id]?.type;

// Can chain multiple levels
obj?.parent?.userData?.id
```

---

## Nullish Coalescing

`??` provides a default value when something is null or undefined:

```javascript
const rx = state?.rx ?? 0;
// If state.rx is null or undefined, use 0
// Different from || which also treats 0 and "" as falsy
```

---

## localStorage

Browser storage that persists across page reloads. Used in Auth to keep the user logged in:

```javascript
// Save
localStorage.setItem('token', result.token);
localStorage.setItem('user', JSON.stringify(result.user));

// Read
const saved = localStorage.getItem('user');
const user = saved ? JSON.parse(saved) : null;

// Remove (logout)
localStorage.removeItem('token');
localStorage.removeItem('user');
```

> Data is stored as strings, so objects need `JSON.stringify()` to save and `JSON.parse()` to read back.

---

## Regular Expressions

Used for email validation on both frontend and backend:

```javascript
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
```

Breaking it down:
- `^` = start of string
- `[^\s@]+` = one or more characters that are not whitespace or @
- `@` = literal @ symbol
- `[^\s@]+` = domain name
- `\.` = literal dot
- `[^\s@]+$` = extension + end of string

---

## Event System

### CustomEvent + dispatchEvent (Pub/Sub on window)

I needed components that are NOT parent-child in React to communicate. Components like the Context menu, Selection panel, and SetupView are separate branches in the React tree. I couldn't use props or context without restructuring everything.

Solution: use `CustomEvent` + `dispatchEvent` on the `window` object as a pub/sub system.

```javascript
// FIRE an event (any component can do this)
window.dispatchEvent(new CustomEvent('studio:select', { detail: selectedId }));

// LISTEN for an event (any other component)
useEffect(() => {
  const handler = (e) => {
    const id = e.detail;  // Get the data from the event
    setSelected(id);
  };
  window.addEventListener('studio:select', handler);
  return () => window.removeEventListener('studio:select', handler);
}, []);
```

Events I use:
- `studio:select` — when an object is clicked, sidebar updates
- `studio:delete-element` — context menu tells scene to remove object
- `studio:context-menu` — scene tells context menu to open at position
- `studio:set-gizmo-mode` — toolbar tells scene to switch move/rotate
- `studio:position-update` — gizmo drag tells sidebar to update values

> Every listener MUST be removed in the useEffect cleanup or they stack up and cause bugs.

---

## JSON

JavaScript Object Notation. Used to send data between frontend and backend.

```javascript
// Object to string (for sending/storing)
JSON.stringify({ name: "scene1", data: sceneData })

// String to object (for reading)
JSON.parse(scene.scene_data)
```

In the backend, scene data is stored as a JSON string in the database (`nvarchar(max)`), then parsed back when loaded.

---

## try/catch for Error Handling

Same concept as C++ but used for both sync and async errors:

```javascript
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
} catch {
  return res.status(401).json({ error: 'Invalid token' });
}
```

With async/await, `try/catch` also catches Promise rejections (network errors, database failures, etc.).