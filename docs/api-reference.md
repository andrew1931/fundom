## DOM utils

### elem$

**Type:** `(name: string, ...utils: FunDomUtil[]) => ((...fns: FunDomUtil[]) => HTMLElement);`

- creates HTML element;
- accepts type of element as first argument and any number of dom utils from this reference to mutate element's state, returns a function which accepts more dom utils (made for extending elements) and returns created element;
```typescript
import { elem$ } from 'fundom';

const title = elem$('h1');

document.body.appendChild(title());
```

### txt$

**Type:** `(value: string | number | FunStateGetter<string | number> | FormatReturnValue) => FunDomUtil;`

- sets innerText value on current element;
- accepts string / number / FunStateGetter with string or number;

```typescript
import { elem$, txt$ } from 'fundom';

const title = elem$('h1', txt$('Api reference'));
```

### html$

**Type:** `(value: string | number | FunStateGetter<string | number> | FormatReturnValue) => FunDomUtil;`

- sets innerHTML value on current element;
- accepts string / number / FunStateGetter with string or number;

```typescript
import { elem$, html$ } from 'fundom';

const title = elem$('h1', html$('<span>Api reference</span>'));
```

### nodes$

**Type:** `(() => HTMLElement)[] | HTMLElement[]) => FunDomUtil;`

- inserts passed HTML elements into current element;
- accepts any number of elem$ functions or HTML elements to be inserted into current element;
```typescript
import { elem$, nodes$ } from 'fundom';

const section = elem$(
   'section',
   nodes$(
      elem$('p', txt$('first child')), // can be function
      elem$('p')(txt$('second child')) // or HTMLElement
   )
);
```

### list$

**Type:** `<T>(data: Array<T> | FunStateGetter<Array<T>>, newElementFn: (item: T, index: number) => ReturnType<typeof elem$>) => FunDomUtil;`

- inserts list of HTML elements into current element by passed array;
- accepts array of items / FunStateGetter with array of items and function which should return elem$ utility which is called on every element of provided array
```typescript
import { elem$, nodes$, list$ } from 'fundom';

const data = [{ value: 'one' }, { value: 'two' }];

const section = elem$(
   'section',
   list$(data, (item, index) => {
      return elem$('p', txt$(item.value))
   })
);
```

### style$

**Type:** `(props: Record<string, string | number | FunStateGetter<string | number> | FormatReturnValue;>) => FunDomUtil;`

- applies inline styles to current element;
- style keys can be passed either in camel or kebab case;

```typescript
import { elem$, style$ } from 'fundom';

const section = elem$(
   'section',
   style$({
      fontSize: '1em',
      backgroundColor: '#f2f2f2',
      'padding-top': '10px' // can be paddingTop as well
   })
);
```

### class$

**Type:** `(...(string | number | FunStateGetter<string | number> | FormatReturnValue)) => FunDomUtil;`

- adds classes to current element;

```typescript
import { elem$, class$ } from 'fundom';

const section = elem$(
   'section',
   class$('padding-md', 'flex', 'justify-top')
);
```

### attr$

**Type:** `(props: Record<string, string | number | FunStateGetter<string | number> | FormatReturnValue;>) => FunDomUtil;`

- adds attributes to current element;

```typescript
import { elem$, attr$ } from 'fundom';

const input = elem$(
   'input',
   attr$({ type: 'search', name: 'search-user' })
);
```

### ifElse$

**Type:** `<T>(condition: Condition<T>) => (...fns1: FunDomUtil[]) => (...fns2: FunDomUtil[]) => FunDomUtil;`

- applies utilities from second function and reverts utilities from third function if condition is truthy or the other way around;

```typescript
import { elem$, ifElse$, class$, funState } from 'fundom';

const [getLoading, setLoading] = funState(true);

const div = elem$(
   'div',
   ifElse$(getLoading)(
      elem$('span', txt$('loading...')),
      class$('loading-users')
   )(
      elem$('span', txt$('loaded')),
   )
);
```

### if$

**Type:** `<T>(condition: Condition<T>) => (...fns1: FunDomUtil[]) => FunDomUtil;`

- applies utilities from second function if condition is truthy or reverts them otherwise;

```typescript
import { elem$, if$, class$, funState } from 'fundom';

const [getLoading, setLoading] = funState(true);

const div = elem$(
   'div',
   if$(getLoading)(
      class$('loading-users')
   )
);
```

### on$

**Type:** `(type: string, cb: (e: Event) => void, offEvent?: FunStateGetter<boolean>) => FunDomUtil;`

- adds event listener with provided type and callback (types are the same as for addEventListener method of document);
- accepts optional FunStateGetter<boolean> to removeEventListener;

```typescript
import { elem$, on$, funState } from 'fundom';

const [unsubscribeClick, setUnsubscribeClick] = funState(false);

setTimeout(() => {
   setUnsubscribeClick(true);
}, 5000);

const button = elem$(
   'button',
   on$('click', (e) => console.log(e), unsubscribeClick)
);
```

## Compute utils

### comp$

**Type:** `<T, U>(stateGetter: FunStateGetter<T>, computer: (val: T) => U) => (handler: (val: unknown, firstHandle: boolean) => void) => void;`

- utility to compute value of reactive state (or any data if you wish) with callback;
- accepts state getter and computer callback which is invoked every time state changes;

```typescript
import { elem$, if$, attr$, comp$, funState } from 'fundom';

const [getCount, setCount] = funState({ count: 1 });

const button = elem$(
   'button',
   on$('click', () => setCount(getCount() + 1))
   if$(comp$(getCount, (val) => val.count > 5))(
      attr$({ disabled: 'disabled' })
   )
);
```

### fmt$

**Type:** `(...values: Array<string | number | FunStateGetter<string | number> | ComputeReturnValue | FormatReturnValue>) => (handler: (val: string | number, firstHandle: boolean) => void) => void;`

- utility to format strings with reactive state

```typescript
import { elem$, txt$, comp$, fmt$, funState } from 'fundom';

const [getCount, setCount] = funState({ count: 1 });

const buttonConfig = { id: 1, name: 'submit' };

const button = elem$(
   'button',
   txt$(fmt$('value of counter: {} on button {}', getCount, buttonConfig.name))
);

const span = elem$(
   'span',
   txt$(
      fmt$(
         'next value of counter: {}',
         comp$(getCount, (v) => v.value + 1)
      )
   )
);
```
