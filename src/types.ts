export type FunStateSub<T> = (nextValue: T, ...args: any[]) => void;
export type FunStateOnReleaseEffect = () => void;
export type FunStateGetter<T> = (
   subCb?: FunStateSub<T>,
   releaseEffect?: FunStateOnReleaseEffect,
) => T;
export type FunState = <T>(
   initialValue: T,
) => [getter: FunStateGetter<T>, setter: FunStateSub<T>, releaser: (sub?: FunStateSub<T>) => void];

export type FormatReturnValue = (
   handler: (val: string | number, firstHandle: boolean) => void,
) => void;

export type ComputeReturnValue = (handler: (val: unknown, firstHandle: boolean) => void) => void;

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

export type FunDomUtil = (
   el: HTMLElement,
   snapshot: ElementSnapshot | null,
   comment: Comment | null,
   context: string[],
) => HTMLElement;
