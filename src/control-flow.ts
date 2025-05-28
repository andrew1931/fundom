import {
   _appendComment,
   _applyMutations,
   _createContext,
   _handleUtilityIncomingValue,
   _hasChild,
   _makeSnapshot,
   _randomId,
   _removeChildren,
   _revertMutations,
} from './_utils';
import type {
   IfElseCondition,
   FunDomUtil,
   FunStateGetter
} from './types';

export const createElement = (
   name: string, ...utils: FunDomUtil[]
): (...fns: FunDomUtil[]) => HTMLElement => {
   return function elementCreator(...extraUtils: FunDomUtil[]) {
      const el = document.createElement(name);
      const context =  _createContext(el.nodeName);
      _applyMutations(
         el,
         [...utils, ...extraUtils],
         _makeSnapshot(el),
         undefined,
         context
      );
      return el;
   }
};

export const appendChildren = (
   ...values: (() => HTMLElement)[] | HTMLElement[]
): FunDomUtil => {
   const children: HTMLElement[] = [];
   return function childrenAppender(el, _snapshot, useRevert, comment) {
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
         if (useRevert) {
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

export const appendList = <T>(
   data: Array<T> | FunStateGetter<Array<T>>,
   newElementFn: (item: T, index: number) => ReturnType<typeof createElement>
): FunDomUtil => {
   const comment = document.createComment('');
   let prevChildren: HTMLElement[] = [];
   let prevItems: Array<T> = [];
   return (el, snapshot, _useRevert, parentComment, context) => {
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
                     _applyMutations(
                        el,
                        [appendChildren(child)],
                        snapshot,
                        comment,
                        context
                     );
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
            _applyMutations(
               el,
               [appendChildren(...children)],
               snapshot,
               comment,
               context
            );
         }
         
         prevChildren = children;
         prevItems = items;
      }

      _handleUtilityIncomingValue(data, handler);

      return el;
   };
};

export const ifElse = <T>(condition: IfElseCondition<T>) => (...fns1: FunDomUtil[]) => (...fns2: FunDomUtil[]): FunDomUtil => {
   const id = _randomId('cond_');
   const comment = document.createComment('');
   return function ifElseResolver(el, _snapshot, _useRevert, parentComment, context) {
      const snapshot = _makeSnapshot(el);
      function handler(val: unknown, firstHandle = false): void {
         if (Boolean(val) === true) {
            if (!firstHandle) {
               _revertMutations(el, fns2, snapshot, comment, context);
            }
            _applyMutations(
               el,
               fns1,
               snapshot,
               comment,
               context
            );
         } else {
            if (!firstHandle) {
               _revertMutations(el, fns1, snapshot, comment, context);
            }
            _applyMutations(
               el,
               fns2,
               snapshot,
               comment,
               context
            );
         }
      }

      if (!context.hasUtility(id)) {
         context.registerUtility(id);
         _appendComment(el, comment, parentComment);
         _handleUtilityIncomingValue(condition, handler);
      }
      return el;
   }
};

export const onlyIf = <T>(condition: IfElseCondition<T>) => (...fns1: FunDomUtil[]): FunDomUtil => {
   return ifElse(condition)(...fns1)();
};