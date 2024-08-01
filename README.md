# Generational Indices
A simple library which provides a generational index allocator.

## Example Usage
```js
// If you're using TypeScript, you may also import `GenerationalIndex` as a type to describe an index.
// type GenerationalIndex = { index: number, generation: number }
const { GenerationalAllocator } = require("generational_indices");
const allocator = new GenerationalAllocator();

const id = allocator.allocate(); // { index: 0, generation: 0 }
const id2 = allocator.allocate(); // { index: 1, generation: 0 }

allocator.free(id.index);
allocator.is_valid(id); // false (it got freed)
allocator.is_valid(id2); // true (its still active)

const id3 = allocator.allocate(); // { index: 0, generation: 1 }
```

## What are generational indices?
Generational indices are a way to reuse indices safely. More specifically, they are a way to reuse indices while avoiding the [ABA Problem](https://en.wikipedia.org/wiki/ABA_problem).

To summarise the ABA problem:
- Assume you associate the index `1` with some data:
```js
const data = {};
const id = allocator.generate_id(); // 1
data[id] = { angle: 0, position: 0 }
```
- Your program stores these ids as a reference in multiple places
```js
// for simplicity, it will be stored in one place
// but it will likely be in multiple scattered places
socials[id] = { name: "Altanis", friends: [] }
```
- You destroy the data associated with `1`:
```js
data[id] = undefined;
```
- You then create a new entity (and reuse the id `1`)
```js
const id = allocator.generate_id(); // 1
data[id] = { angle: 0, position 0 } // this guy is actually Bob and has 500 friends
```
- When you lookup Bob's socials, you will see:
```js
console.log(socials[id]); // { name: "Altanis", friends: [] }
```

Uh oh. Even though the `id` is meant for Bob, Altanis's data show's up. This is the ABA problem.

## How do generational indices fix this?
A generational index stores a generation alongside the index/id. When an index is reused, the generation is incremented. In our previous example, this would fix the issue as such:
```js
const altanis_id = allocator.generate_id(); // { index: 1, generation: 0 }
socials[id]; // { name: "Altanis", friends: [] }

data[id] = undefined;
allocator.free(id);

const bob_id = allocator.generate_id(); // { index: 1, generation: 1 }
socials[bob_id]; // { name: "Bob", friends: Array(500) }
socials[altanis_id]; // { name: "Altanis", friends: [] }
```