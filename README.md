# Generational Indices
A simple library which provides a generational index allocator.

## Example Usage
```js

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