import { FD } from '../utils/_elementUpdater';

type RegistryItemValue = ((value: any) => void)[];

type RegistrySybscribers = Map<FD.Element | number, RegistryItemValue>;

interface IObservableRegistry {
   for: (id: symbol, el: FD.Element | number, fn: (value: any) => void) => void;
   valueFor: (id: symbol) => RegistrySybscribers | undefined;
   register: (id: symbol) => void;
   unregister: (id: symbol) => void;
   clearSubscribers: (id: symbol, el: FD.Element | undefined | number) => void;
   entries: () => IterableIterator<[symbol, RegistrySybscribers]>;
}

export const ObservablesRegistry: IObservableRegistry = (() => {
   let observables: Map<symbol, RegistrySybscribers> = new Map();

   return {
      for(id, el, fn) {
         if (!observables.has(id)) {
            ObservablesRegistry.register(id);
         }
         const targetSubscribers = observables.get(id)?.get(el);
         if (targetSubscribers) {
            targetSubscribers.push(fn);
         } else {
            observables.get(id)?.set(el, [fn]);
         }
      },

      valueFor(id) {
         return observables.get(id);
      },

      register(id) {
         observables.set(id, new Map());
      },

      unregister(id) {
         observables.delete(id);
      },

      clearSubscribers(id, el) {
         if (!el) return;
         observables.get(id)?.delete(el);
      },

      entries() {
         return observables.entries();
      },
   };
})();
