import type { FormatReturnValue, ComputeReturnValue, FunDomUtil, FunStateGetter } from './types';

export const FN_TYPE = Symbol('fnType');
export const FN_TYPE_FORMAT = Symbol('format');
export const FN_TYPE_COMPUTE = Symbol('compute');
export const FN_TYPE_STATE_GETTER = Symbol('stateGetter');

export const _applyMutations = (
   el: HTMLElement,
   fns: FunDomUtil[],
   snapshot: HTMLElement | null,
   comment: Comment | null,
   context: string[],
) => {
   if (fns.length === 0) return;
   for (let fn of fns) {
      fn(el, snapshot, comment, context);
   }
};

export const _camelToKebab = (prop: string): string => {
   if (typeof prop !== 'string') {
      return '';
   }
   return prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
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
   parentComment: Comment | null,
): void => {
   if (!_hasChild(el, comment)) {
      if (parentComment) {
         el.insertBefore(comment, parentComment.nextSibling);
      } else {
         el.appendChild(comment);
      }
   }
};

export const _isStateGetter = (value: unknown): value is FunStateGetter<unknown> => {
   return _isFunction(value) && (value as any)[FN_TYPE] === FN_TYPE_STATE_GETTER;
};

export const _isFormatUtil = (value: unknown): value is FormatReturnValue => {
   return _isFunction(value) && (value as any)[FN_TYPE] === FN_TYPE_FORMAT;
};

export const _isComputeUtil = (value: unknown): value is ComputeReturnValue => {
   return _isFunction(value) && (value as any)[FN_TYPE] === FN_TYPE_COMPUTE;
};

export const _handleUtilityIncomingValue = (
   value: unknown,
   handler: (val: any, firstHandle: boolean) => void,
): void => {
   if (_isComputeUtil(value) || _isFormatUtil(value)) {
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

export const _hasChild = (parent: HTMLElement, child: HTMLElement | Comment): boolean => {
   // NOTE: probably has better performance than parent.contains(child)
   return child.parentNode === parent;
};

export const _removeChildren = (parent: HTMLElement, ...children: HTMLElement[]) => {
   for (let child of children) {
      if (_hasChild(parent, child)) {
         parent.removeChild(child);
      }
   }
};

export const _isFunction = (value: unknown): value is Function => typeof value === 'function';

export const _isHtmlElement = (el: unknown) => el && el instanceof HTMLElement;

export class NotHTMLElementError extends Error {
   constructor(origin: string) {
      super();
      this.message = `value passed to ${origin} is not HTMLElement type`;
   }
}
