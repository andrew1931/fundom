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
   TagName,
} from './types';

export const elem = <K extends TagName>(name: K, ...utils: FunDomUtil<K>[]) => {
   return (...extraUtils: FunDomUtil<K>[]): HTMLElementTagNameMap[K] => {
      const el = document.createElement(name);
      _applyMutations(el, [...utils, ...extraUtils], {}, '', false);
      return el;
   };
};

export const children = <K extends TagName, C extends TagName>(
   ...values: Array<(() => HTMLElementTagNameMap[C]) | HTMLElementTagNameMap[C]>
): FunDomUtil<K> => {
   const childrenElements: HTMLElementTagNameMap[C][] = [];
   return (el, context, ctrlFlowId, useRevert) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('children').message);
         return el;
      }
      // TODO: compare performance with createDocumentFragment

      if (childrenElements.length === 0) {
         for (let element of values) {
            if (_isFunction(element)) {
               const el = element();
               if (_isHtmlElement(el)) {
                  childrenElements.push(el);
               } else {
                  console.warn('[children] passed function does not return HTMLElement type');
               }
            } else {
               if (_isHtmlElement(element)) {
                  childrenElements.push(element);
               } else {
                  console.warn('[children] passed argument is not HTMLElement type');
               }
            }
         }
      }

      if (useRevert) {
         _removeChildren(el, ...childrenElements);
      } else {
         const comment = context[ctrlFlowId]?.comment;
         for (let childElem of childrenElements) {
            if (!_hasChild(el, childElem)) {
               if (comment && comment instanceof Comment) {
                  el.insertBefore(childElem, comment);
               } else {
                  el.appendChild(childElem);
               }
            }
         }
      }
      return el;
   };
};

export const child = <K extends TagName, C extends TagName>(
   name: C,
   ...utils: FunDomUtil<C>[]
): FunDomUtil<K> => {
   let childElem: HTMLElementTagNameMap[C] | null = null;
   return (el, context, ctrlFlowId, useRevert) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('child').message);
         return el;
      }
      if (!_isHtmlElement(childElem)) {
         childElem = elem(name, ...utils)();
      }
      _applyMutations(
         el,
         [children(childElem as HTMLElementTagNameMap[C])],
         context,
         ctrlFlowId,
         useRevert,
      );
      return el;
   };
};

export const list = <T, K extends TagName>(
   data: Array<T> | FunStateGetter<Array<T>>,
   newElementFn: (item: T, index: number) => ReturnType<typeof elem<K>>,
): FunDomUtil<K> => {
   const comment = document.createComment('');
   let prevChildren: HTMLElementTagNameMap[K][] = [];
   let prevItems: Array<T> = [];
   return (el, context, ctrlFlowId, useRevert) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('list').message);
         return el;
      }

      _appendComment(el, comment, context[ctrlFlowId]?.comment);

      const handler = (items: Array<T>) => {
         if (!Array.isArray(items)) {
            console.warn('[list] first argument of list should be Array');
            return;
         }
         if (!_isFunction(newElementFn)) {
            console.warn('[list] second argument of list should be ReturnType<typeof elem>');
            return;
         }

         const curChildren: HTMLElementTagNameMap[K][] = [];
         if (prevItems.length > 0) {
            for (let [i, item] of items.entries()) {
               if (Object.is(item, prevItems[i])) {
                  curChildren.push(prevChildren[i] as HTMLElementTagNameMap[K]);
               } else {
                  const childElem = newElementFn(item, i)();
                  curChildren.push(childElem);
                  if (i < prevItems.length) {
                     el.replaceChild(childElem, prevChildren[i] as HTMLElementTagNameMap[K]);
                  } else {
                     _applyMutations(el, [children(childElem)], context, ctrlFlowId, useRevert);
                  }
               }
            }

            if (prevItems.length > items.length) {
               for (let i = prevItems.length - 1; i >= items.length; i--) {
                  _removeChildren(el, prevChildren[i] as HTMLElementTagNameMap[K]);
               }
            }
         } else {
            for (let [i, item] of items.entries()) {
               curChildren.push(newElementFn(item, i)());
            }
            _applyMutations(el, [children(...curChildren)], context, ctrlFlowId, useRevert);
         }

         prevChildren = curChildren;
         prevItems = items;
      };

      _handleUtilityIncomingValue<Array<T>>(data, handler);

      return el;
   };
};

export const ifElse =
   <T, K extends TagName>(condition: Condition<T>) =>
   (...fns1: FunDomUtil<K>[]) =>
   (...fns2: FunDomUtil<K>[]): FunDomUtil<K> => {
      return _handleControlFlow(condition, (val) => {
         return Boolean(val) ? fns1 : fns2;
      });
   };

export const ifOnly =
   <T, K extends TagName>(condition: Condition<T>) =>
   (...fns1: FunDomUtil<K>[]): FunDomUtil<K> => {
      return ifElse<T, K>(condition)(...fns1)();
   };

export const match =
   <K extends TagName>(data: any) =>
   (...cases: CaseReturnValue<K>[]): FunDomUtil<K> => {
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

export const matchCase =
   <K extends TagName>(caseValue?: unknown) =>
   (...fns: FunDomUtil<K>[]): CaseReturnValue<K> => {
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

export const html = <K extends TagName>(value: UtilIncomingValue): FunDomUtil<K> => {
   return (el, context, ctrlFlowId, useRevert) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('html').message);
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

export const txt = <K extends TagName>(value: UtilIncomingValue): FunDomUtil<K> => {
   return (el, context, ctrlFlowId, useRevert) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('txt').message);
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

export const style = <K extends TagName>(
   props: Record<string, UtilIncomingValue>,
): FunDomUtil<K> => {
   return (el, context, ctrlFlowId, useRevert) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('style').message);
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

export const classList = <K extends TagName>(...classNames: UtilIncomingValue[]): FunDomUtil<K> => {
   return (el, context, ctrlFlowId, useRevert) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('classList').message);
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
                     console.warn(`[revert classList] class ${classString} existed before add`);
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

export const attr = <K extends TagName>(
   props: Record<string, UtilIncomingValue>,
): FunDomUtil<K> => {
   return (el, context, ctrlFlowId, useRevert) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('attr').message);
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

export const on = <K extends TagName>(
   type: string,
   cb: (e: Event) => void,
   options?: {
      capture?: boolean;
      once?: boolean;
      passive?: boolean;
      signal?: AbortSignal;
      offTrigger?: FunStateGetter<boolean>;
   },
): FunDomUtil<K> => {
   return (el) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('on').message);
         return el;
      }

      el.addEventListener(type, cb, options);

      if (options && options.offTrigger) {
         options.offTrigger(() => {
            el.removeEventListener(type, cb);
         });
      }

      return el;
   };
};
