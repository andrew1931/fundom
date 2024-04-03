import { type FD } from './_elementUpdater';

export type OnRemoveCallback = (...args: any[]) => any;

export type MappedElementsItemValue = [any, FD.Element, number];

export interface IPipeContext {
   addOnRemoveCallbacks: (callbacks: OnRemoveCallback[]) => void;
   releaseOnRemoveCallbacks: () => void;
   addRef: (refName: string, el: FD.Element) => void;
   findRef: (refName: string) => FD.Element | undefined;
   clearRefs: () => void;
   addUnsubscribeCallback: (callback: () => void) => void;
   releaseUnsubscribeCallbacks: () => void;
   getMappedElementsItem: (key: symbol, trackKey: any) => MappedElementsItemValue | undefined;
   updateMappedElementsItem: (key: symbol, trackKey: any, value: MappedElementsItemValue) => void;
   getMappedElementsItemEntries: (key: symbol) => IterableIterator<[any, MappedElementsItemValue]> | [];
   deleteMappedElementsItem: (key: symbol, trackKey: any) => void;
   clearMappedElements: () => void;
}

interface IPipeContextHandler {
   create: (el: FD.Element) => IPipeContext;
   destroy: (el: FD.Element) => void;
}

interface IGlobalContext {
   addContext: (el: FD.Element, context: IPipeContext) => IPipeContext;
   removeContext: (el: FD.Element) => void;
   findContext: (el: FD.Element) => IPipeContext | undefined;
   addRef: (refName: string, el: FD.Element) => void;
   findRef: (refName: string) => FD.Element | undefined;
   clearRefs: () => void;
   cleanUp: (el: FD.Element) => void;
}

export const _GlobalContext = ((): IGlobalContext => {
   let contexts: Map<FD.Element, IPipeContext> = new Map();
   let globalRefs: Map<string, FD.Element> = new Map();

   return {
      findContext: (el: FD.Element) => {
         return contexts.get(el);
      },
      addContext: (el: FD.Element, context: IPipeContext) => {
         if (!contexts.has(el)) {
            contexts.set(el, context);
         }
         return context;
      },
      removeContext: (el: FD.Element) => {
         if (contexts.has(el)) {
            contexts.delete(el);
         }
      },
      addRef: (refName: string, el: FD.Element) => {
         globalRefs.set(refName, el);
      },
      findRef: (refName: string) => {
         return globalRefs.get(refName);
      },
      clearRefs: () => {
         globalRefs.clear();
      },
      cleanUp: (target) => {
         for (let [el, context] of contexts.entries()) {
            // clear contexts if is target element or a child of target
            if (el === target || target.contains(el)) {
               context.releaseUnsubscribeCallbacks();
               context.clearMappedElements();
               context.clearRefs();
               for (let [refName, refEl] of globalRefs.entries()) {
                  if (refEl === el) {
                     globalRefs.delete(refName);
                  }
               }
               _GlobalContext.removeContext(el);
            }
         }
      },
   };
})();

export const _PipeContext = ((): IPipeContextHandler => {
   let createContext = (): IPipeContext => {
      let onRemoveCallbacks: OnRemoveCallback[] = [];
      let unsubscribeCallbacks: (() => void)[] = [];
      let refs: Map<string, FD.Element> = new Map();
      let prevMappedElements: Map<symbol, Map<any, MappedElementsItemValue>> = new Map();

      return {
         getMappedElementsItem: (key: symbol, trackKey: any) => {
            let target = prevMappedElements.get(key);
            if (target) {
               return target.get(trackKey);
            }
            return undefined;
         },
         updateMappedElementsItem: (key: symbol, trackKey: any, value: MappedElementsItemValue) => {
            if (!prevMappedElements.has(key)) {
               prevMappedElements.set(key, new Map());
            }
            prevMappedElements.get(key)?.set(trackKey, value);
         },
         getMappedElementsItemEntries: (key: symbol) => {
            let target = prevMappedElements.get(key);
            if (target) {
               return target.entries();
            }
            return [];
         },
         deleteMappedElementsItem: (key: symbol, trackKey: any) => {
            let target = prevMappedElements.get(key);
            if (target) {
               target.delete(trackKey);
            }
         },
         clearMappedElements: () => {
            prevMappedElements.clear();
         },
         addRef: (refName: string, el: FD.Element) => {
            refs.set(refName, el);
         },
         findRef: (refName: string) => {
            return refs.get(refName);
         },
         clearRefs: () => {
            refs.clear();
         },
         addOnRemoveCallbacks: (callbacks: OnRemoveCallback[]) => {
            onRemoveCallbacks = onRemoveCallbacks.concat(callbacks);
         },
         releaseOnRemoveCallbacks: () => {
            onRemoveCallbacks.forEach((cb) => cb());
            onRemoveCallbacks = [];
         },
         addUnsubscribeCallback: (callback) => {
            unsubscribeCallbacks.push(callback);
         },
         releaseUnsubscribeCallbacks: () => {
            unsubscribeCallbacks.forEach((cb) => cb());
            unsubscribeCallbacks = [];
         },
      };
   };

   return {
      create: (el: FD.Element) => {
         return _GlobalContext.addContext(el, createContext());
      },
      destroy: (el: FD.Element) => {
         _GlobalContext.removeContext(el);
      },
   };
})();
