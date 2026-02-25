# JavaScript Personal Notes

My learning notes for JavaScript concepts used in this project

## Table of Contents

1. [Variables](#variables)
2. [Data Types](#data-types)
3. [Functions](#functions)

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