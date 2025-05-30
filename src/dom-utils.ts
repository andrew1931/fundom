import {
   _appendComment,
   _applyMutations,
   _camelToKebab,
   _handleUtilityIncomingValue,
   _hasChild,
   _makeSnapshot,
   _randomId,
   _removeChildren,
} from './_utils';
import type { UtilIncomingValue, FunDomUtil, FunStateGetter, Condition } from './types';

export const element$ = (
   name: string,
   ...utils: FunDomUtil[]
): ((...fns: FunDomUtil[]) => HTMLElement) => {
   return function elementCreator(...extraUtils: FunDomUtil[]) {
      const el = document.createElement(name);
      _applyMutations(el, [...utils, ...extraUtils], null, null, []);
      return el;
   };
};

export const children$ = (...values: (() => HTMLElement)[] | HTMLElement[]): FunDomUtil => {
   const children: HTMLElement[] = [];
   return function childrenInserter(el, snapshot, comment) {
      if (children.length === 0) {
         for (let element of values) {
            if (typeof element === 'function') {
               children.push(element());
            } else {
               children.push(element);
            }
         }
      }

      for (let child of children) {
         if (snapshot) {
            _removeChildren(el, ...children);
         } else {
            if (!_hasChild(el, child)) {
               if (comment !== undefined) {
                  el.insertBefore(child, comment);
               } else {
                  el.appendChild(child);
               }
            }
         }
      }
      return el;
   };
};

export const list$ = <T>(
   data: Array<T> | FunStateGetter<Array<T>>,
   newElementFn: (item: T, index: number) => ReturnType<typeof element$>,
): FunDomUtil => {
   const comment = document.createComment('');
   let prevChildren: HTMLElement[] = [];
   let prevItems: Array<T> = [];
   return function listCreator(el, snapshot, parentComment, context) {
      _appendComment(el, comment, parentComment);

      const handler = (items: Array<T>) => {
         const children: HTMLElement[] = [];
         if (prevItems.length > 0) {
            for (let [i, item] of items.entries()) {
               if (Object.is(item, prevItems[i])) {
                  children.push(prevChildren[i] as HTMLElement);
               } else {
                  const child = newElementFn(item, i)();
                  children.push(child);
                  if (i < prevItems.length) {
                     el.replaceChild(child, prevChildren[i] as HTMLElement);
                  } else {
                     _applyMutations(el, [children$(child)], snapshot, comment, context);
                  }
               }
            }

            if (prevItems.length > items.length) {
               for (let i = prevItems.length - 1; i >= items.length; i--) {
                  _removeChildren(el, prevChildren[i] as HTMLElement);
               }
            }
         } else {
            for (let [i, item] of items.entries()) {
               children.push(newElementFn(item, i)());
            }
            _applyMutations(el, [children$(...children)], snapshot, comment, context);
         }

         prevChildren = children;
         prevItems = items;
      };

      _handleUtilityIncomingValue(data, handler);

      return el;
   };
};

export const ifElse$ =
   <T>(condition: Condition<T>) =>
   (...fns1: FunDomUtil[]) =>
   (...fns2: FunDomUtil[]): FunDomUtil => {
      const id = _randomId('cond_');
      const comment = document.createComment('');
      return function ifElseResolver(el, _parentSnapshot, parentComment, context) {
         const snapshot = _makeSnapshot(el);
         function handler(val: unknown, firstHandle = false): void {
            if (Boolean(val) === true) {
               if (!firstHandle) {
                  // revert fns2
                  _applyMutations(el, fns2, snapshot, comment, context);
               }
               _applyMutations(el, fns1, null, comment, context);
            } else {
               if (!firstHandle) {
                  // revert fns1
                  _applyMutations(el, fns1, snapshot, comment, context);
               }
               _applyMutations(el, fns2, null, comment, context);
            }
         }

         if (context.indexOf(id) === -1) {
            context.push(id);
            /* 
               NOTE: comment is used for appending element before it
               so it is located in the same order in DOM as it is inside element$ function
            */
            _appendComment(el, comment, parentComment);
            _handleUtilityIncomingValue(condition, handler);
         }
         return el;
      };
   };

export const if$ =
   <T>(condition: Condition<T>) =>
   (...fns1: FunDomUtil[]): FunDomUtil => {
      return ifElse$(condition)(...fns1)();
   };

export const html$ = (value: UtilIncomingValue): FunDomUtil => {
   return function innerHtmlMutator(el, snapshot) {
      const handler = (val: string | number) => {
         if (snapshot) {
            el.innerHTML = snapshot.innerHTML;
         } else {
            el.innerHTML = String(val);
         }
      };
      _handleUtilityIncomingValue(value, handler);
      return el;
   };
};

export const text$ = (value: UtilIncomingValue): FunDomUtil => {
   return function innerTextMutator(el, snapshot) {
      const handler = (val: string | number) => {
         if (snapshot) {
            el.innerText = snapshot.innerText;
         } else {
            el.innerText = String(val);
         }
      };
      _handleUtilityIncomingValue(value, handler);
      return el;
   };
};

export const style$ = (props: Record<string, UtilIncomingValue>): FunDomUtil => {
   return function styleMutator(el, snapshot) {
      for (let [_key, propValue] of Object.entries(props)) {
         const key = _camelToKebab(_key);
         const handler = (value: string | number) => {
            if (snapshot) {
               if (snapshot.style.getPropertyValue(key) !== '') {
                  el.style.setProperty(key, snapshot.style.getPropertyValue(key));
               } else {
                  el.style.removeProperty(key);
               }
            } else {
               el.style.setProperty(key, String(value));
            }
         };
         _handleUtilityIncomingValue(propValue, handler);
      }
      return el;
   };
};

export const classlist$ = (...classNames: UtilIncomingValue[]): FunDomUtil => {
   return function classlistMutator(el, snapshot) {
      for (let className of classNames) {
         let prevAddedValue: string | undefined;
         const handler = (value: string | number) => {
            const classString = String(value);
            if (snapshot) {
               if (!snapshot.classList.contains(classString)) {
                  el.classList.remove(classString);
               } else {
                  console.warn(`[revert classList] className ${classString} existed before add`);
               }
            } else {
               if (prevAddedValue) {
                  el.classList.remove(prevAddedValue);
               }
               el.classList.add(classString);
               prevAddedValue = classString;
            }
         };
         _handleUtilityIncomingValue(className, handler);
      }
      return el;
   };
};

export const attributes$ = (props: Record<string, UtilIncomingValue>): FunDomUtil => {
   return function attributesMutator(el, snapshot) {
      for (let [key, propValue] of Object.entries(props)) {
         const handler = (value: string | number) => {
            if (snapshot) {
               if (snapshot.hasAttribute(key)) {
                  el.setAttribute(key, snapshot.getAttribute(key) || '');
               } else {
                  el.removeAttribute(key);
               }
            } else {
               el.setAttribute(key, String(value));
            }
         };
         _handleUtilityIncomingValue(propValue, handler);
      }
      return el;
   };
};

export const on$ = (type: string, cb: (e: Event) => void): FunDomUtil => {
   return function eventListener(el) {
      el.addEventListener(type, cb);
      return el;
   };
};
