import {
   _appendComment,
   _applyMutations,
   _createContext,
   _handleIncomingValue,
   _makeSnapshot,
   _randomId,
   _revertMutations,
} from './_utils';
import { append } from './dom-utils';
import type { IfElseCondition, FunDomUtil } from './types';

export const createElement = (
   name: string, ...utils: FunDomUtil[]
): (...fns: FunDomUtil[]) => HTMLElement => {
   return function elementCreator(...extraUtils: FunDomUtil[]) {
      const el = document.createElement(name);
      const context =  _createContext();
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

export const ifElse = <T>(condition: IfElseCondition<T>) => (...fns1: FunDomUtil[]) => (...fns2: FunDomUtil[]): FunDomUtil => {
   const id = _randomId('ifElse_');
   const comment = document.createComment('');
   return function ifElseResolver(el, _snapshot, _useRevert, _comment, _context) {
      const snapshot = _makeSnapshot(el);
      function handler(val: unknown, firstHandle = false): void {
         if (Boolean(val) === true) {
            if (!firstHandle) {
               _revertMutations(el, fns2, snapshot, comment, _context);
            }
            _applyMutations(
               el,
               fns1,
               snapshot,
               comment,
               _context
            );
         } else {
            if (!firstHandle) {
               _revertMutations(el, fns1, snapshot, comment, _context);
            }
            _applyMutations(
               el,
               fns2,
               snapshot,
               comment,
               _context
            );
         }
      }

      if (!_context.hasUtility(id)) {
         _context.registerUtility(id);
         _appendComment(el, comment, _comment);
         _handleIncomingValue(condition, handler);
      }
      return el;
   }
};

export const appendList = <T>(data: Array<T>) => (newElementFn: (item: T) => ReturnType<typeof createElement>): FunDomUtil => {
   const comment = document.createComment('');
   return (el, snapshot, _useRevert, _comment, _context) => {
      _appendComment(el, comment, _comment);
      for (const item of data) {
         append(newElementFn(item))(el, snapshot, false, comment, _context);
      }
      return el;
   };
};