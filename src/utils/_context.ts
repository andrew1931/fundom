import { type FD } from './_elementUpdater';
import { _GlobalContext } from './_globalContext';

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
   getMappedElementsItemEntries: (
      key: symbol,
   ) => IterableIterator<[any, MappedElementsItemValue]> | [];
   deleteMappedElementsItem: (key: symbol, trackKey: any) => void;
   clearMappedElements: () => void;
}

export interface IPipeContextPublicApi {
   addRef: IPipeContext['addRef'];
   findRef: IPipeContext['findRef'];
}

interface IPipeContextHandler {
   create: (el: FD.Element) => IPipeContext;
   destroy: (el: FD.Element) => void;
}

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
