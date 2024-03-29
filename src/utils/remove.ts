import { ObservablesRegistry } from '../observable/observableRegistry';

const cleanUpSubscribers = <T extends HTMLElement>(el: T): void => {
   for (let [id, o] of ObservablesRegistry.entries()) {
      for (let [key] of o.entries()) {
         if (key instanceof HTMLElement) {
            // clear subscribers if is target element or a child
            if (key === el || el.contains(key)) {
               ObservablesRegistry.clearSubscribers(id, key);
            }
         }
      }
   }
}

export const removeAndCleanUp = <T extends HTMLElement>(el: T): void => {
   el.remove();
   cleanUpSubscribers(el);
}

export const removeWithoutCleanUp = <T extends HTMLElement>(el: T) => {
   el.remove();
}
