## Fundom

Lightweight JavaScript library to work with DOM api in declarative way with reactive state in functional style.
It provides a minimum amount of utils to create, mutate and control flow of HTML elements and state api for reactive changes.

## Example

Simple counter
```typescript
   import { elem$, txt$, fmt$, on$, funState } from 'fundom';

   const [getCount, setCount] = funState(0);

   const counter = elem$(
      'button',
      txt$(fmt$('current value: {}', getCount)),
      on$('click', () => setCount(getCount() + 1))
   );

   document.body.append(counter());
```