export type FunStateSub<T> = (nextValue: T, ...args: any[]) => void;
export type FunStateGetter<T> = (subCb?: FunStateSub<T>) => T;

export type IncomingComputedItem = string | number | FunStateGetter<string | number>;

export type ComputedReturnValue = (handler: (val: string | number, firstHandle: boolean) => void) => void;

export type ComputedStateReturnValue = (handler: (val: boolean, firstHandle: boolean) => void) => void;

export type UtilIncomingValue = string | number | FunStateGetter<string | number> | ComputedReturnValue;

export type IfElseCondition<T> = boolean | FunStateGetter<T> | ComputedStateReturnValue;

export type FunDomElementHistoryEvent = Record<string, string | number | boolean>;

export type FunDomElementContext = {
   makeHistory(event: FunDomElementHistoryEvent): void;
   registerUtility(id: string): void;
   hasUtility(id: string): boolean;
   getInfo(): {
      nodeName: string;
      history: FunDomElementHistoryEvent[];
      utilities: string[];
   };
};

export type FunDomUtil = (
   el: HTMLElement,
   snapshot: HTMLElement,
   useRevert: boolean,
   comment: Comment | undefined,
   context: FunDomElementContext,
) => HTMLElement;

export type AppendRemoveIncomingValues = ((() => HTMLElement) | HTMLElement)[];