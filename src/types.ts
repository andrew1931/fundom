export type FunStateSub<T> = (nextValue: T, ...args: any[]) => void;
export type FunStateGetter<T> = (subCb?: FunStateSub<T>) => T;

export type IncomingFormatItem = string | number | FunStateGetter<string | number>;

export type FormatReturnValue = (
   handler: (val: string | number, firstHandle: boolean) => void,
) => void;

export type BoolReturnValue = (handler: (val: boolean, firstHandle: boolean) => void) => void;

export type UtilIncomingValue =
   | string
   | number
   | FunStateGetter<string | number>
   | FormatReturnValue;

export type Condition<T> = boolean | FunStateGetter<T> | BoolReturnValue;

export type FunDomElementHistoryEvent = Record<string, string | number | boolean>;

export type FunDomUtil = (
   el: HTMLElement,
   snapshot: HTMLElement | null,
   comment: Comment | null,
   context: string[],
) => HTMLElement;
