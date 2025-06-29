import type {
   FormatReturnValue,
   ComputeReturnValue,
   FunDomUtil,
   FunStateGetter,
   ElementSnapshot,
   ElementContext,
   ControlFlowContext,
   ControlFlowId,
   CaseReturnValue,
   FunUtilHandler,
   TextValue,
   TagName,
} from './types';

export const FN_TYPE = Symbol('fnType');
export const FN_TYPE_FORMAT = Symbol('format');
export const FN_TYPE_COMPUTE = Symbol('compute');
export const FN_TYPE_STATE_GETTER = Symbol('stateGetter');
export const FN_TYPE_CASE_HANDLER = Symbol('caseHandler');

export const _applyMutations = <K extends TagName>(
   el: HTMLElementTagNameMap[K],
   fns: FunDomUtil<K>[],
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
   comment: Comment | undefined,
): ControlFlowContext => {
   return {
      snapshot: _makeSnapshot(el),
      comment,
   };
};

export const _makeSnapshot = (el: HTMLElement): ElementSnapshot => {
   return {
      childrenLength: el.children.length,
      innerHTML: el.innerHTML,
      innerText: el.innerText,
      textContent: el.textContent || '',
      style: el.style,
      attributes: el.attributes,
      classList: el.classList,
   };
};

export const _randomId = (prefix = ''): string => {
   return Math.random().toString(36).replace('0.', prefix);
};

/* 
   NOTE: comment is used for appending element before it
   so it is located in the same order in DOM as it is inside elem function
*/
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

export const _isStateGetter = <T>(value: unknown): value is FunStateGetter<T> => {
   return _isFunction(value) && (value as any)[FN_TYPE] === FN_TYPE_STATE_GETTER;
};

export const _isFormatUtil = (value: unknown): value is FormatReturnValue => {
   return _isFunction(value) && (value as any)[FN_TYPE] === FN_TYPE_FORMAT;
};

export const _isComputeUtil = <T>(value: unknown): value is ComputeReturnValue<T> => {
   return _isFunction(value) && (value as any)[FN_TYPE] === FN_TYPE_COMPUTE;
};

export const _isCaseUtil = <K extends TagName>(value: unknown): value is CaseReturnValue<K> => {
   return _isFunction(value) && (value as any)[FN_TYPE] === FN_TYPE_CASE_HANDLER;
};

export const _ctrlFlowReleaseEffect = (ctrlFlowContext: ControlFlowContext | undefined): void => {
   if (ctrlFlowContext) {
      ctrlFlowContext.snapshot = null;
   }
};

export const _handleUtilityIncomingValue = <T>(
   value: unknown,
   handler: FunUtilHandler<T>,
   ctrlFlowContext?: ControlFlowContext,
): void => {
   if (_isComputeUtil<T>(value)) {
      value(handler);
   } else if (_isFormatUtil(value)) {
      value(handler as FunUtilHandler<TextValue>);
   } else {
      if (_isStateGetter<T>(value)) {
         const val = value((v) => handler(v), {
            releaseEffect: () => _ctrlFlowReleaseEffect(ctrlFlowContext),
         });
         handler(val);
      } else {
         handler(value as T);
      }
   }
};

export const _handleControlFlow = <T, U, K extends TagName>(
   data: T,
   targetFnsGetter: (v: U) => FunDomUtil<K>[],
): FunDomUtil<K> => {
   const ctrlFlowId = _randomId('ctrlFlow_');
   const comment = document.createComment('');
   let prevApplied: FunDomUtil<K>[] = [];
   let prevReverted: FunDomUtil<K>[] = [];
   return (el, context, parentCtrlFlowId, useRevert) => {
      if (!_isHtmlElement(el)) {
         console.warn(new NotHTMLElementError('ifElse/ifOnly/match').message);
         return el;
      }

      const handler = (val: U): void => {
         if (useRevert) {
            if (prevApplied !== prevReverted) {
               _applyMutations(el, prevApplied, context, ctrlFlowId, true);
               prevReverted = prevApplied;
            }
         } else {
            const targetFns = targetFnsGetter(val);
            if (prevApplied !== targetFns) {
               _applyMutations(el, prevApplied, context, ctrlFlowId, true);
               _applyMutations(el, targetFns, context, ctrlFlowId, false);
               prevApplied = targetFns;
               prevReverted = [];
            }
         }
      };

      if (!(ctrlFlowId in context)) {
         context[ctrlFlowId] = _createContextItem(el, comment);
         _appendComment(el, comment, context[parentCtrlFlowId]?.comment);
      }
      _handleUtilityIncomingValue<U>(data, handler, context[ctrlFlowId]);
      return el;
   };
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
