import {
   _appendComment,
   _applyMutations,
   _camelToKebab,
   _handleUtilityIncomingValue,
   _hasChild,
   _isFunction,
   _isHtmlElement,
   _makeSnapshot,
   _randomId,
   _removeChildren,
   NotHTMLElementError,
} from './_utils';
import type { UtilIncomingValue, FunDomUtil, FunStateGetter, Condition } from './types';

export const elem$ = (
   name: string,
   ...utils: FunDomUtil[]
): ((...fns: FunDomUtil[]) => HTMLElement) => {
   return (...extraUtils: FunDomUtil[]) => {
      const el = document.createElement(name);
      _applyMutations(el, [...utils, ...extraUtils], null, null, []);
      return el;
   };
};

export const nodes$ = (...values: (() => HTMLElement)[] | HTMLElement[]): FunDomUtil => {
   const children: HTMLElement[] = [];
   return (el, snapshot, comment) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('nodes$').message);
         return el;
      }

      // TODO: think of how not to invoke create element fn if snapshot is passed and children array is empty but el.children length > 0
      if (snapshot && el.children.length === 0) {
         return el; // nothing to revert
      }

      if (children.length === 0) {
         for (let element of values) {
            if (_isFunction(element)) {
               const el = element();
               if (_isHtmlElement(el)) {
                  children.push(el);
               } else {
                  console.warn('[nodes$] passed function does not return HTMLElement type');
               }
            } else {
               if (_isHtmlElement(element)) {
                  children.push(element);
               } else {
                  console.warn('[nodes$] passed argument is not HTMLElement type');
               }
            }
         }
      }

      if (snapshot) {
         _removeChildren(el, ...children);
      } else {
         for (let child of children) {
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
   newElementFn: (item: T, index: number) => ReturnType<typeof elem$>,
): FunDomUtil => {
   const comment = document.createComment('');
   let prevChildren: HTMLElement[] = [];
   let prevItems: Array<T> = [];
   return (el, snapshot, parentComment, context) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('list$').message);
         return el;
      }

      _appendComment(el, comment, parentComment);

      const handler = (items: Array<T>) => {
         if (!Array.isArray(items)) {
            console.warn('[list$] first argument of list$ should be Array');
            return;
         }
         if (!_isFunction(newElementFn)) {
            console.warn('[list$] second argument of list$ should be ReturnType<typeof elem$>');
            return;
         }

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
                     _applyMutations(el, [nodes$(child)], snapshot, comment, context);
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
            _applyMutations(el, [nodes$(...children)], snapshot, comment, context);
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
      return (el, _parentSnapshot, parentComment, context) => {
         if (!_isHtmlElement(el)) {
            console.warn(new NotHTMLElementError('ifElse$').message);
            return el;
         }

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
               so it is located in the same order in DOM as it is inside elem$ function
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
   return (el, snapshot) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('html$').message);
         return el;
      }

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

export const txt$ = (value: UtilIncomingValue): FunDomUtil => {
   return (el, snapshot) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('txt$').message);
         return el;
      }

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
   return (el, snapshot) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('style$').message);
         return el;
      }

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

export const class$ = (...classNames: UtilIncomingValue[]): FunDomUtil => {
   return (el, snapshot) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('class$').message);
         return el;
      }

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

export const attr$ = (props: Record<string, UtilIncomingValue>): FunDomUtil => {
   return (el, snapshot) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('attr$').message);
         return el;
      }

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

export const on$ = (
   type: string,
   cb: (e: Event) => void,
   offEvent?: FunStateGetter<boolean>,
): FunDomUtil => {
   return (el) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('on$').message);
         return el;
      }

      el.addEventListener(type, cb);

      if (offEvent) {
         offEvent(() => {
            el.removeEventListener(type, cb);
         });
      }

      return el;
   };
};
