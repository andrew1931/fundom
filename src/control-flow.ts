import {
   _appendComment,
   _applyMutations,
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
   return (...extraUtils: FunDomUtil[]) => {
      const el = document.createElement(name);
      const snapshot = _makeSnapshot(el);
      return _applyMutations(el, [...utils, ...extraUtils], snapshot);
   }
};

// todo: put to some registry
const ifElseIds: string[] = [];

export const ifElse = <T>(condition: IfElseCondition<T>) => (...fns1: FunDomUtil[]) => (...fns2: FunDomUtil[]): FunDomUtil => {
   const id = _randomId('ifElse');
   const comment = document.createComment('');
   return (el, _snapshot, _useRevert, _comment) => {
      const snapshot = _makeSnapshot(el);
      function handler(val: unknown, firstHandle = false): HTMLElement {
         if (Boolean(val) === true) {
            return _applyMutations(
               !firstHandle ? _revertMutations(el, fns2, snapshot, comment) : el,
               fns1,
               snapshot,
               comment
            );
         }
         return _applyMutations(
            !firstHandle ? _revertMutations(el, fns1, snapshot, comment) : el,
            fns2,
            snapshot,
            comment
         );
      }

      if (ifElseIds.indexOf(id) === -1) {
         ifElseIds.push(id);
         _appendComment(el, comment, _comment);
         _handleIncomingValue(condition, handler);
      }
      return el;
   }
};

export const map = <T>(data: Array<T>) => (cb: (item: T) => ReturnType<typeof createElement>): FunDomUtil => {
   const comment = document.createComment('');
   return (el, snapshot, _useRevert, _comment) => {
      _appendComment(el, comment, _comment);
      for (const item of data) {
         const newElement = cb(item)();
         _applyMutations(el, [append(newElement)], snapshot, comment);
      }
      return el;
   };
};

// for side effects
export const forEach = <T>(data: Array<T>) => (cb: (item: T) => void): FunDomUtil => {
   return (el) => {
      for (const item of data) {
         cb(item);
      }
      return el;
   };
};