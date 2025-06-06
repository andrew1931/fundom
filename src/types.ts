export type FunStateSub<T> = (nextValue: T, ...args: any[]) => void;
export type FunStateOnReleaseEffect = () => void;
export type FunStateGetter<T> = (
   subCb?: FunStateSub<T>,
   releaseEffect?: FunStateOnReleaseEffect,
) => T;
export type FunStateAction = 'pause' | 'resume' | 'release';
export type FunStateController<T> = (action: FunStateAction, sub?: FunStateSub<T>) => void;
export type FunStateSetterCallback<T> = (controller: FunStateController<T>) => void;
export type FunStateSetter<T> = (value: T | FunStateSetterCallback<T>) => void;
export type FunState = <T>(
   initialValue: T,
) => [getter: FunStateGetter<T>, setter: FunStateSetter<T>];

export type FormatReturnValue = (
   handler: (val: string | number, firstHandle: boolean) => void,
) => void;

export type ComputeReturnValue = (handler: (val: unknown, firstHandle: boolean) => void) => void;

export type ControlFlowHandler = (val: any, firstHandle: boolean) => void;

export type IncomingFormatItem =
   | string
   | number
   | FunStateGetter<string | number>
   | ComputeReturnValue
   | FormatReturnValue;

export type UtilIncomingValue =
   | string
   | number
   | FunStateGetter<string | number>
   | FormatReturnValue;

export type Condition<T> = boolean | FunStateGetter<T> | ComputeReturnValue;

export type FunDomElementHistoryEvent = Record<string, string | number | boolean>;

export type ElementSnapshot = {
   childrenLength: number;
   innerHTML: string;
   innerText: string;
   style: CSSStyleDeclaration;
   attributes: NamedNodeMap;
   classList: DOMTokenList;
};

export type ControlFlowId = string;
export type ControlFlowContext = {
   snapshot: ElementSnapshot | null;
   comment: Comment | undefined;
   handler: ControlFlowHandler | undefined;
};
export type ElementContext = Record<ControlFlowId, ControlFlowContext>;

export type FunDomUtil = (
   el: HTMLElement,
   context: ElementContext,
   ctrlFlowId: ControlFlowId,
   useRevert: boolean,
) => HTMLElement;
