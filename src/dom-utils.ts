import {
   _applyMutations,
   _camelToKebab,
   _handleUtilityIncomingValue,
   _hasChild
} from './_utils';
import type {
   UtilIncomingValue,
   FunDomUtil,
   AppendRemoveIncomingValues
} from './types';

const _populateAppendRemoveChildren = (
   children: HTMLElement[],
   elements: AppendRemoveIncomingValues
) => {
   if (children.length === 0) {
      for (const element of elements) {
         if (typeof element === 'function') {
            children.push(element());
         } else {
            children.push(element);
         }
      }
   }
};

export const append = (...values: AppendRemoveIncomingValues): FunDomUtil => {
   let children: HTMLElement[] = []
   return function childrenAppender(el, snapshot, useRevert, comment, context) {
      _populateAppendRemoveChildren(children, values);

      for (const child of children) {
         if (useRevert) {
            _applyMutations(
               el,
               [remove(...children)],
               snapshot,
               comment,
               context
            );
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

export const remove = (...values: AppendRemoveIncomingValues): FunDomUtil => {
   let children: HTMLElement[] = []
   return function childrenRemover(el, snapshot, useRevert, comment, context) {
      _populateAppendRemoveChildren(children, values);

      for (const child of children) {
         if (useRevert) {
            _applyMutations(
               el,
               [append(...children)],
               snapshot,
               comment,
               context
            );
         } else {
            if (_hasChild(el, child)) {
               el.removeChild(child);
            }
         }
      }
      return el;
   };
};

export const innerHTML = (value: UtilIncomingValue): FunDomUtil => {
   return function innerHtmlMutator(el, snapshot, useRevert) {
      const handler = (val: string | number) => {
         if (useRevert) {
            el.innerHTML = snapshot.innerHTML;
         } else {
            el.innerHTML = String(val);
         }
      };
      _handleUtilityIncomingValue(value, handler);
      return el;
   };
};

export const innerText = (value: UtilIncomingValue): FunDomUtil => {
   return function innerTextMutator(el, snapshot, useRevert) {
      const handler = (val: string | number) => {
         if (useRevert) {
            el.innerText = snapshot.innerText;
         } else {
            el.innerText = String(val);
         }
      };
      _handleUtilityIncomingValue(value, handler);
      return el;
   };
};

export const style = (props: Record<string, UtilIncomingValue>): FunDomUtil => {
   return function styleMutator(el, snapshot, useRevert) {
      for (const [_key, propValue] of Object.entries(props)) {
         const key = _camelToKebab(_key); 
         const handler = (value: string | number) => {
            if (useRevert) {
               if (snapshot.style.getPropertyValue(key) !== '') {
                  el.style.setProperty(
                     key,
                     snapshot.style.getPropertyValue(key)
                  );
               } else {
                  el.style.removeProperty(key);
               }
            } else {
               el.style.setProperty(key, String(value));
            }
         }
         _handleUtilityIncomingValue(propValue, handler);
      }
      return el;
   };
};

export const classList = (...classNames: UtilIncomingValue[]): FunDomUtil => {
   return function classlistMutator(el, snapshot, useRevert) {
      for (const className of classNames) {
         let prevAddedValue: string | undefined;
         const handler = (value: string | number) => {
            const classString = String(value);
            if (useRevert) {
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
         }
         _handleUtilityIncomingValue(className, handler);
      }
      return el;
   };
};

export const setAttribute = (props: Record<string, UtilIncomingValue>): FunDomUtil => {
   return function attributeMutator(el, snapshot, useRevert) {
      for (const [key, propValue] of Object.entries(props)) {
         const handler = (value: string | number) => {
            if (useRevert) {
               if (snapshot.hasAttribute(key)) {
                  el.setAttribute(
                     key,
                     snapshot.getAttribute(key) || ''
                  );
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

export const addEventListener = (type: string, cb: (e: Event) => void): FunDomUtil => {
   return function eventListener(el) {
      el.addEventListener(type, cb);
      return el;
   };
};
