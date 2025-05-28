import { _camelToKebab, _handleUtilityIncomingValue } from './_utils';
import type { UtilIncomingValue, FunDomUtil } from './types';

export const html$ = (value: UtilIncomingValue): FunDomUtil => {
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

export const text$ = (value: UtilIncomingValue): FunDomUtil => {
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

export const style$ = (props: Record<string, UtilIncomingValue>): FunDomUtil => {
   return function styleMutator(el, snapshot, useRevert) {
      for (let [_key, propValue] of Object.entries(props)) {
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

export const classlist$ = (...classNames: UtilIncomingValue[]): FunDomUtil => {
   return function classlistMutator(el, snapshot, useRevert) {
      for (let className of classNames) {
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

export const attributes$ = (props: Record<string, UtilIncomingValue>): FunDomUtil => {
   return function attributesMutator(el, snapshot, useRevert) {
      for (let [key, propValue] of Object.entries(props)) {
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

export const on$ = (type: string, cb: (e: Event) => void): FunDomUtil => {
   return function eventListener(el) {
      el.addEventListener(type, cb);
      return el;
   };
};
