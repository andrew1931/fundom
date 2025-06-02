## Fundom

Lightweight JavaScript library to work with DOM api in declarative way with reactive state in functional style.
It provides a minimum amount of utils to create, mutate and control flow of HTML elements and state api for reactive changes.

## Example:

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

## Existing features

- creating HTML elements;
- rendering lists of HTML elements from arrays of data;
- changing current element's state: styles, attributes, classes, children;
- conditionally changing current element's state;
- adding and removing current element's event listeners;
- creating reactive state;

## Not existing features

- utils for removing elements, attributes, classes, styles (considered as side effects and should be implemented with control flow utils (i.e. ifElse$, if$) by providing state getter as value);
- utils to change other elements state (considered as side effects, each element has its own context, all implemented utils can mutate only current element's state. All elements' changes should be implemented via reactive state);
- utils like *createRoot*, *render* or *mount* (Fundom does not have any global context or anything, all utils are independent units. Fundom is designed to create HTML elements in declarative way and mutate them by providing reactive states);

## Docs

- [Api reference](./docs/api-reference.md)