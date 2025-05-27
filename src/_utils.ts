import type {
   ComputedReturnValue,
   ComputedStateReturnValue,
   FunDomUtil,
   FunStateGetter,
   FunDomElementContext,
   FunDomElementHistoryEvent
} from './types';
import { useFunDomDebug$ } from './utils';

export const FN_TYPE = Symbol('fnType');
export const FN_TYPE_COMPUTE = Symbol('compute');
export const FN_TYPE_COMPUTE_STATE = Symbol('computeState');
export const FN_TYPE_STATE_GETTER = Symbol('stateGetter');

export const _createContext = (nodeName: string): FunDomElementContext => {
   const history: FunDomElementHistoryEvent[] = [];
   const utilities: string[] = [];

   return {
      makeHistory(event: FunDomElementHistoryEvent) {
         history.push(event);
      },
      registerUtility(id: string) {
         utilities.push(id);
      },
      hasUtility(id: string) {
         return utilities.indexOf(id) > -1;
      },
      getInfo() {
         return {
            nodeName,
            history,
            utilities
         };
      }
   }
};

const _callUtilsOnElement = (
   el: HTMLElement,
   fns: FunDomUtil[],
   snapshot: HTMLElement,
   useRevert: boolean,
   comment: Comment | undefined,
   context: FunDomElementContext,
): void => {
   if (fns.length === 0) return;
   for (let fn of fns) {
      if (useFunDomDebug$()) {
         context.makeHistory({ mutation: fn.name, revert: useRevert });
      }
      el = fn.call(this, el, snapshot, useRevert, comment, context);
   }
};

export const _applyMutations = (
   el: HTMLElement,
   fns: FunDomUtil[],
   snapshot: HTMLElement,
   comment: Comment | undefined,
   context: FunDomElementContext,
) => {
   _callUtilsOnElement(el, fns, snapshot, false, comment, context);
};

export const _revertMutations = (
   el: HTMLElement,
   fns: FunDomUtil[],
   snapshot: HTMLElement,
   comment: Comment | undefined,
   context: FunDomElementContext,
) => {
   _callUtilsOnElement(el, fns, snapshot, true, comment, context);
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
): void => {
   if (!_hasChild(el, comment)) {
      if (parentComment !== undefined) {
         el.insertBefore(comment, parentComment.nextSibling);
      } else {
         el.appendChild(comment);
      }
   }
};

export const _isStateGetter = (value: unknown): value is FunStateGetter<unknown> => {
   // @ts-ignore
   return typeof value === 'function' && value[FN_TYPE] === FN_TYPE_STATE_GETTER;
};

const _isComputedUtil = (value: unknown): value is ComputedReturnValue  => {
   // @ts-ignore
   return typeof value === 'function' && value[FN_TYPE] === FN_TYPE_COMPUTE;
};

const _isComputedStateUtil = (value: unknown): value is ComputedStateReturnValue  => {
   // @ts-ignore
   return typeof value === 'function' && value[FN_TYPE] === FN_TYPE_COMPUTE_STATE;
};

export const _handleUtilityIncomingValue = (
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

export const _hasChild = (
   parent: HTMLElement,
   child: HTMLElement | Comment,
): boolean => {
   // note: probably has better performance than parent.contains(child)
   return child.parentNode === parent;
};