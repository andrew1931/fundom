import { IPipeContext } from './_context';
import { type FD } from './_elementUpdater';

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
