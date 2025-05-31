## Fundom

Lightweight minimalistic library to work with DOM api in declarative way with reactive state

## Counter example
```tsx
   import { element$, text$, fmt$, funState } from 'fundom';

   const [getCount, setCount] = funState(0);
   const counter = element$(
      'button',
      text$(fmt$('number of clicks: {}', getCount)),
      on('click', () => setCount(getCount() + 1))
   );

   document.body.appendChild(counter())
```