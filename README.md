## Fundom

Lightweight minimalistic library to work with DOM api in declarative way with reactive state

```tsx
   import { element$, text$, format$, funState } from 'fundom';

   const [getCount, setCount] = funState(0);
   const counter = element$(
      'button',
      text$(format$('number of clicks: {}', getCount)),
      on('click', () => setCount(getCount() + 1))
   );

   document.body.appendChild(counter())
```