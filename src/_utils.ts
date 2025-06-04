import type {
   FormatReturnValue,
   ComputeReturnValue,
   FunDomUtil,
   FunStateGetter,
   ElementSnapshot,
   ElementContext,
   ControlFlowContext,
   ControlFlowId,
} from './types';

export const FN_TYPE = Symbol('fnType');
export const FN_TYPE_FORMAT = Symbol('format');
export const FN_TYPE_COMPUTE = Symbol('compute');
export const FN_TYPE_STATE_GETTER = Symbol('stateGetter');

export const _applyMutations = (
   el: HTMLElement,
   fns: FunDomUtil[],
   context: ElementContext,
   ctrlFlowId: ControlFlowId,
   useRevert: boolean,
) => {
   if (fns.length === 0) return;
   for (let fn of fns) {
      fn(el, context, ctrlFlowId, useRevert);
   }
};

export const _camelToKebab = (prop: string): string => {
   if (typeof prop !== 'string') {
      return '';
   }
   return prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

export const _createContextItem = (
   el: HTMLElement,
   comment: Comment | undefined
): ControlFlowContext => {
   return {
      snapshot: _makeSnapshot(el),
      comment
   };
}

export const _makeSnapshot = (el: HTMLElement): ElementSnapshot => {
   return {
      childrenLength: el.children.length,
      innerHTML: el.innerHTML,
      innerText: el.innerText,
      style: el.style,
      attributes: el.attributes,
      classList: el.classList,
   };
};

export const _randomId = (prefix = ''): string => {
   return Math.random().toString(36).replace('0.', prefix);
};

export const _appendComment = (
   el: HTMLElement,
   comment: Comment,
   parentComment: Comment | undefined,
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

export const _ctrlFlowReleaseEffect = (ctrlFlowContext: ControlFlowContext | undefined): void => {
   if (ctrlFlowContext) {
      ctrlFlowContext.snapshot = null
   }
};

export const _handleUtilityIncomingValue = (
   value: unknown,
   handler: (val: any, firstHandle: boolean) => void,
   ctrlFlowContext?: ControlFlowContext
): void => {
   if (_isComputeUtil(value) || _isFormatUtil(value)) {
      value(handler);
   } else {
      if (_isStateGetter(value)) {
         const val = value(
            (v) => handler(v, false),
            () => _ctrlFlowReleaseEffect(ctrlFlowContext)
         );
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

export class NoSnapshotError extends Error {
   constructor(id: string) {
      super();
      this.message = `snapshot for id ${id} does not exist`;
   }
}
