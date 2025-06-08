export type FunStateSub<T> = (nextValue: T, ...args: any[]) => void;
export type FunStateOnReleaseEffect = () => void;
export type FunStateGetterOptions = {
   once?: boolean;
   releaseEffect?: FunStateOnReleaseEffect;
};
export type FunStateGetter<T> = (subCb?: FunStateSub<T>, options?: FunStateGetterOptions) => T;
export type FunStateAction = 'pause' | 'resume' | 'release';
export type FunStateController<T> = (action: FunStateAction, sub?: FunStateSub<T>) => void;
export type FunStateSetterCallback<T> = (controller: FunStateController<T>) => void;
export type FunStateSetter<T> = (value: T | FunStateSetterCallback<T>) => void;
export type FunState = <T>(
   initialValue: T,
) => [getter: FunStateGetter<T>, setter: FunStateSetter<T>];

export type FunUtilHandler<T> = (val: T) => void;

export type FormatReturnValue = (handler: FunUtilHandler<TextValue>) => void;

export type ComputeReturnValue<T> = (handler: FunUtilHandler<T>) => void;

export type IncomingFormatItem<T> =
   | TextValue
   | FunStateGetter<TextValue>
   | ComputeReturnValue<T>
   | FormatReturnValue;

export type UtilIncomingValue = TextValue | FunStateGetter<TextValue> | FormatReturnValue;

export type Condition<T> = boolean | FunStateGetter<T> | ComputeReturnValue<T>;

export type CaseReturnValue = (value: any, isLast: boolean) => FunDomUtil[];

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
};
export type ElementContext = Record<ControlFlowId, ControlFlowContext>;

export type FunDomUtil = (
   el: HTMLElement,
   context: ElementContext,
   ctrlFlowId: ControlFlowId,
   useRevert: boolean,
) => HTMLElement;

export type TextValue = string | number;
