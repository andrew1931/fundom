## funState

- creates reactive state with initial value;
- returns getter, setter, pauserResumer, releaser functions in array;

```typescript
import { funState } from 'fundom';

const [getState, setState, pauserResumer, releaser] = funState(1);

const subscriber = (val) => {};

const value = getState(
   subscriber, // <- optional subscriber to changes, invoked every time setState provides new value
   () => {} // <- optional effect when releaser is invoked
);

pauserResumer(subscriber) // pause target subscriber

setState(3) // // subscriber is not invoked since state is on pause

pauserResumer() // pause all (in this flow works like resumer since there is only one subscriber and it is already paused)

setState(4) // subscriber is invoked since state is resumed

setState(4) // subscriber is not invoked since value is the same

releaser(subscriber) // release target subscriber

releaser() // release all (in this flow is ignored since there are no other subscribers)

setState(5) // subscriber is not invoked since state is released

```

## DOM utils

### elem$

- creates HTML element;

```typescript
import { elem$ } from 'fundom';

const title = elem$('h1');

document.body.appendChild(title());
```

### txt$

- sets innerText value on current element;

```typescript
import { elem$, txt$ } from 'fundom';

const title = elem$('h1', txt$('Api reference'));
```

### html$

- sets innerHTML value on current element;

```typescript
import { elem$, html$ } from 'fundom';

const title = elem$('h1', html$('<span>Api reference</span>'));
```

### nodes$

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

- inserts list of HTML elements into current element by provided array;

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

- adds classes to current element;

```typescript
import { elem$, class$ } from 'fundom';

const section = elem$(
   'section',
   class$('padding-md', 'flex', 'justify-top')
);
```

### attr$

- adds attributes to current element;

```typescript
import { elem$, attr$ } from 'fundom';

const input = elem$(
   'input',
   attr$({ type: 'search', name: 'search-user' })
);
```

### ifElse$

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

- utility to compute value of reactive state (or any data if you wish) with callback;
- accepts state getter and computer callback which is invoked every time state changes;

```typescript
import { elem$, if$, attr$, comp$, funState } from 'fundom';

const [getCount, setCount] = funState({ count: 1 });

const button = elem$(
   'button',
   on$('click', () => setCount({ count: getCount().count + 1 })
   if$(comp$(getCount, (val) => val.count > 5))(
      attr$({ disabled: 'disabled' })
   )
);
```

### fmt$

- utility to format strings with reactive state

```typescript
import { elem$, txt$, comp$, fmt$, funState } from 'fundom';

const [getCount, setCount] = funState(1);

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
         comp$(getCount, (count) => count + 1)
      )
   )
);
```
