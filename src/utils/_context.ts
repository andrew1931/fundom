import { type FD } from './_elementUpdater';

export type OnRemoveCallback = (...args: any[]) => any;

export interface IPipeContextHandler {
   create: (el: FD.Element) => IPipeContext;
   destroy: (el: FD.Element) => void;
}

export interface IPipeContext {
   id: symbol;
   addBeforeRemoveCallbacks: (callbacks: OnRemoveCallback[]) => void;
   addAfterRemoveCallbacks: (callbacks: OnRemoveCallback[]) => void;
   releaseBeforeRemoveCallbacks: () => void;
   releaseAfterRemoveCallbacks: () => void;
   addRef: (refName: string, el: FD.Element) => void;
   findRef: (refName: string) => FD.Element | undefined;
   clearRefs: () => void;
   addUnsibscribeCallback: (callback: () => void) => void;
   releaseUnsubscribeCallbacks: () => void;
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
               context.clearRefs();
               for (let [refName, refEl] of globalRefs.entries()) {
                  if (refEl === el) {
                     globalRefs.delete(refName);
                  }
               }
               contexts.delete(el);
            }
         }
      },
   };
})();

export const _PipeContext = ((): IPipeContextHandler => {
   let createContext = (): IPipeContext => {
      let beforeRemoveCallbacks: OnRemoveCallback[] = [];
      let afterRemoveCallbacks: OnRemoveCallback[] = [];
      let refs: Map<string, FD.Element> = new Map();
      let unsubscribeCallbacks: (() => void)[] = [];

      return {
         id: Symbol('PipeContext'),
         addRef: (refName: string, el: FD.Element) => {
            refs.set(refName, el);
         },
         findRef: (refName: string) => {
            return refs.get(refName);
         },
         clearRefs: () => {
            refs.clear();
         },
         addBeforeRemoveCallbacks: (callbacks: OnRemoveCallback[]) => {
            beforeRemoveCallbacks = beforeRemoveCallbacks.concat(callbacks);
         },
         addAfterRemoveCallbacks: (callbacks: OnRemoveCallback[]) => {
            afterRemoveCallbacks = afterRemoveCallbacks.concat(callbacks);
         },
         releaseBeforeRemoveCallbacks: () => {
            beforeRemoveCallbacks.forEach((cb) => cb());
            beforeRemoveCallbacks = [];
         },
         releaseAfterRemoveCallbacks: () => {
            afterRemoveCallbacks.forEach((cb) => cb());
            afterRemoveCallbacks = [];
         },
         addUnsibscribeCallback: (callback) => {
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
