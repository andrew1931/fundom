## Fundom

Lightweight JavaScript library to work with DOM api in declarative way with reactive state in functional style.
It provides a minimum amount of utils to create, mutate and control flow of HTML elements + state api for reactive changes.

## Example:

Simple counter
```typescript
   import { elem, txt, fmt, on, funState } from 'fundom';

   const [getCount, setCount] = funState(0);

   const counter = elem(
      'button',
      txt(fmt('current value: {}', getCount)),
      on('click', () => setCount(getCount() + 1))
   );

   document.body.append(counter());
```

## Existing utils

- Creating HTML elements;

- Rendering lists of HTML elements from arrays of data;

- Mutating current element's state (also conditionally): styles, attributes, classes, children;

- Adding and removing current element's event listeners;

- Creating reactive state;

## Not existing utils

- Removing elements, attributes, classes, styles -  *considered as side effects and should be implemented with the help of control flow utils (i.e. ifEls, ifOnly, match) by providing state getter as value*;

- Changing other elements state - *considered as side effects, each element has its own context, all implemented utils can mutate only current element's state. All elements' changes should be implemented via reactive state*;

- Getting reference to other element - *Fundom does not have created element's registry; if one needs to mutate other element from outside elem utility or to read its properties - elem utility returns direct HTML element*;

- Controlling life cycle hooks or utils like *createRoot*, *render* or *mount* - *Fundom does not have any virtual DOM or global context or any registries, all utils are independent units. Fundom is designed to create HTML elements in declarative way and mutate them by providing reactive states*;

## Docs

- [Api reference](https://github.com/andrew1931/fundom/blob/master/docs/api-reference.md)