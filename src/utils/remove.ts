import { ObservablesRegistry } from '../observable/observableRegistry';
import type { FD } from './_elementUpdater';

const cleanUpSubscribers = (el: FD.Element): void => {
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
};

export const removeAndCleanUp = (el: FD.Element): void => {
   el.remove();
   cleanUpSubscribers(el);
};

export const removeWithoutCleanUp = (el: FD.Element) => {
   el.remove();
};
