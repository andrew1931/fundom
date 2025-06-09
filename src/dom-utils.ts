import {
   _appendComment,
   _applyMutations,
   _camelToKebab,
   _createContextItem,
   _handleControlFlow,
   _handleUtilityIncomingValue,
   _hasChild,
   _isCaseUtil,
   _isFunction,
   _isHtmlElement,
   _makeSnapshot,
   _randomId,
   _removeChildren,
   FN_TYPE,
   FN_TYPE_CASE_HANDLER,
   NoSnapshotError,
   NotHTMLElementError,
} from './_utils';
import type {
   UtilIncomingValue,
   FunDomUtil,
   FunStateGetter,
   Condition,
   CaseReturnValue,
   TextValue,
} from './types';

export const elem$ = (
   name: string,
   ...utils: FunDomUtil[]
): ((...fns: FunDomUtil[]) => HTMLElement) => {
   return (...extraUtils: FunDomUtil[]) => {
      const el = document.createElement(name);
      _applyMutations(el, [...utils, ...extraUtils], {}, '', false);
      return el;
   };
};

export const nodes$ = (...values: (() => HTMLElement)[] | HTMLElement[]): FunDomUtil => {
   const children: HTMLElement[] = [];
   return (el, context, ctrlFlowId, useRevert) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('nodes$').message);
         return el;
      }
      // TODO: compare performance with createDocumentFragment

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

      if (useRevert) {
         _removeChildren(el, ...children);
      } else {
         const comment = context[ctrlFlowId]?.comment;
         for (let child of children) {
            if (!_hasChild(el, child)) {
               if (comment && comment instanceof Comment) {
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
   return (el, context, ctrlFlowId, useRevert) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('list$').message);
         return el;
      }

      _appendComment(el, comment, context[ctrlFlowId]?.comment);

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
                     _applyMutations(el, [nodes$(child)], context, ctrlFlowId, useRevert);
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
            _applyMutations(el, [nodes$(...children)], context, ctrlFlowId, useRevert);
         }

         prevChildren = children;
         prevItems = items;
      };

      _handleUtilityIncomingValue<Array<T>>(data, handler);

      return el;
   };
};

export const ifElse$ =
   <T>(condition: Condition<T>) =>
   (...fns1: FunDomUtil[]) =>
   (...fns2: FunDomUtil[]): FunDomUtil => {
      return _handleControlFlow(condition, (val) => {
         return Boolean(val) ? fns1 : fns2;
      });
   };

export const if$ =
   <T>(condition: Condition<T>) =>
   (...fns1: FunDomUtil[]): FunDomUtil => {
      return ifElse$(condition)(...fns1)();
   };

export const switch$ =
   (data: any) =>
   (...cases: CaseReturnValue[]): FunDomUtil => {
      return _handleControlFlow(data, (val) => {
         for (let [index, caseItem] of cases.entries()) {
            if (_isCaseUtil(caseItem)) {
               const fns = caseItem(val, index === cases.length - 1);
               if (fns.length > 0) {
                  return fns;
               }
            }
         }
         return [];
      });
   };

export const case$ =
   (caseValue?: unknown) =>
   (...fns: FunDomUtil[]): CaseReturnValue => {
      caseHandler[FN_TYPE] = FN_TYPE_CASE_HANDLER;
      function caseHandler(value: any, isLast: boolean) {
         if (caseValue === undefined && isLast) {
            // default case
            return fns;
         } else if (_isFunction(caseValue)) {
            if (caseValue(value)) {
               return fns;
            }
         } else {
            if (caseValue === value) {
               return fns;
            }
         }
         return [];
      }
      return caseHandler;
   };

export const html$ = (value: UtilIncomingValue): FunDomUtil => {
   return (el, context, ctrlFlowId, useRevert) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('html$').message);
         return el;
      }

      const handler = (val: TextValue) => {
         if (useRevert) {
            const snapshot = context[ctrlFlowId]?.snapshot;
            if (snapshot) {
               el.innerHTML = snapshot.innerHTML;
            } else {
               console.warn(new NoSnapshotError(ctrlFlowId).message);
            }
         } else {
            el.innerHTML = String(val);
         }
      };
      _handleUtilityIncomingValue<TextValue>(value, handler);
      return el;
   };
};

export const txt$ = (value: UtilIncomingValue): FunDomUtil => {
   return (el, context, ctrlFlowId, useRevert) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('txt$').message);
         return el;
      }

      const handler = (val: TextValue) => {
         if (useRevert) {
            const snapshot = context[ctrlFlowId]?.snapshot;
            if (snapshot) {
               el.innerText = snapshot.innerText;
            } else {
               console.warn(new NoSnapshotError(ctrlFlowId).message);
            }
         } else {
            el.innerText = String(val);
         }
      };
      _handleUtilityIncomingValue<TextValue>(value, handler);
      return el;
   };
};

export const style$ = (props: Record<string, UtilIncomingValue>): FunDomUtil => {
   return (el, context, ctrlFlowId, useRevert) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('style$').message);
         return el;
      }

      for (let [_key, propValue] of Object.entries(props)) {
         const key = _camelToKebab(_key);
         const handler = (value: TextValue) => {
            if (useRevert) {
               const snapshot = context[ctrlFlowId]?.snapshot;
               if (snapshot) {
                  if (snapshot.style.getPropertyValue(key) !== '') {
                     el.style.setProperty(key, snapshot.style.getPropertyValue(key));
                  } else {
                     el.style.removeProperty(key);
                  }
               } else {
                  console.warn(new NoSnapshotError(ctrlFlowId).message);
               }
            } else {
               el.style.setProperty(key, String(value));
            }
         };
         _handleUtilityIncomingValue<TextValue>(propValue, handler);
      }
      return el;
   };
};

export const class$ = (...classNames: UtilIncomingValue[]): FunDomUtil => {
   return (el, context, ctrlFlowId, useRevert) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('class$').message);
         return el;
      }

      for (let className of classNames) {
         let prevAddedValue: string | undefined;
         const handler = (value: TextValue) => {
            const classString = String(value);
            if (useRevert) {
               const snapshot = context[ctrlFlowId]?.snapshot;
               if (snapshot) {
                  if (!snapshot.classList.contains(classString)) {
                     el.classList.remove(classString);
                  } else {
                     console.warn(`[revert classList] className ${classString} existed before add`);
                  }
               } else {
                  console.warn(new NoSnapshotError(ctrlFlowId).message);
               }
            } else {
               if (prevAddedValue) {
                  el.classList.remove(prevAddedValue);
               }
               el.classList.add(classString);
               prevAddedValue = classString;
            }
         };
         _handleUtilityIncomingValue<TextValue>(className, handler);
      }
      return el;
   };
};

export const attr$ = (props: Record<string, UtilIncomingValue>): FunDomUtil => {
   return (el, context, ctrlFlowId, useRevert) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('attr$').message);
         return el;
      }

      for (let [key, propValue] of Object.entries(props)) {
         const handler = (value: TextValue) => {
            if (useRevert) {
               const snapshot = context[ctrlFlowId]?.snapshot;
               if (snapshot) {
                  if (snapshot.attributes.getNamedItem(key)) {
                     el.setAttribute(key, snapshot.attributes.getNamedItem(key)?.value || '');
                  } else {
                     el.removeAttribute(key);
                  }
               } else {
                  console.warn(new NoSnapshotError(ctrlFlowId).message);
               }
            } else {
               el.setAttribute(key, String(value));
            }
         };
         _handleUtilityIncomingValue<TextValue>(propValue, handler);
      }
      return el;
   };
};

export const on$ = (
   type: string,
   cb: (e: Event) => void,
   offTrigger?: FunStateGetter<boolean>,
): FunDomUtil => {
   return (el) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('on$').message);
         return el;
      }

      el.addEventListener(type, cb);

      if (offTrigger) {
         offTrigger(() => {
            el.removeEventListener(type, cb);
         });
      }

      return el;
   };
};
