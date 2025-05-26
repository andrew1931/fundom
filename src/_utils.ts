import type {
   ComputedReturnValue,
   ComputedStateReturnValue,
   FunDomUtil,
   FunStateGetter
} from './types';

export const FN_TYPE = Symbol('fnType');
export const FN_TYPE_COMPUTE = Symbol('compute');
export const FN_TYPE_COMPUTE_STATE = Symbol('computeState');
export const FN_TYPE_FUN_STATE_GETTER = Symbol('funStateGetter');

const _handleApply = (
   el: HTMLElement,
   fns: FunDomUtil[],
   snapshot: HTMLElement,
   comment: Comment | undefined,
   useRevert: boolean,
) => {
   for (let fn of fns) {
      el = fn.call(this, el, snapshot, useRevert, comment);
   }
   return el;
};

export const _applyMutations = (
   el: HTMLElement,
   fns: FunDomUtil[],
   snapshot: HTMLElement,
   comment?: Comment
): HTMLElement => {
   return _handleApply(el, fns, snapshot, comment, false);
};

export const _revertMutations = (
   el: HTMLElement,
   fns: FunDomUtil[],
   snapshot: HTMLElement,
   comment?: Comment
): HTMLElement => {
   return _handleApply(el, fns, snapshot, comment, true);
};

export const _camelToKebab = (prop: string): string => {
   return prop.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};

export const _makeSnapshot = (el: HTMLElement): HTMLElement => {
   return el.cloneNode(true) as HTMLElement;
};

export const _randomId = (prefix = ''): string => {
    return Math.random().toString(36).replace('0.', prefix);
};

export const _appendComment = (
   el: HTMLElement,
   comment: Comment,
   parentComment: Comment | undefined
): Comment => {
   if (parentComment !== undefined) {
      el.insertBefore(comment, parentComment.nextSibling);
   } else {
      el.appendChild(comment);
   }
   return comment;
};

export const _isStateGetter = (value: unknown): value is FunStateGetter<unknown> => {
   // @ts-ignore
   return typeof value === 'function' && value[FN_TYPE] === FN_TYPE_FUN_STATE_GETTER;
};

const _isComputedUtil = (value: unknown): value is ComputedReturnValue  => {
   // @ts-ignore
   return typeof value === 'function' && value[FN_TYPE] === FN_TYPE_COMPUTE;
};

const _isComputedStateUtil = (value: unknown): value is ComputedStateReturnValue  => {
   // @ts-ignore
   return typeof value === 'function' && value[FN_TYPE] === FN_TYPE_COMPUTE_STATE;
};

export const _handleIncomingValue = (
   value: unknown,
   handler: (val: any, firstHandle: boolean) => void,
): void => {
   if (_isComputedStateUtil(value)) {
      value(handler);
   } else if (_isComputedUtil(value)) {
      value(handler);
   } else {   
      if (_isStateGetter(value)) {
         const val = value((v) => handler(v, false));
         handler(val, true);
      } else {
         handler(value, true);
      }  
   }
};