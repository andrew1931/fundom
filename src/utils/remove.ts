import { _GlobalContext, type OnRemoveCallback } from './_context';
import { _elementUpdater, type FD } from './_elementUpdater';


export const removeAndCleanUp = (el: FD.Element): void => {
   _GlobalContext.findContext(el)?.releaseOnRemoveCallbacks();
   el.remove();
   _GlobalContext.cleanUp(el);
};

export const onRemove = (...callbacks: OnRemoveCallback[]) =>
   _elementUpdater((el, context) => {
      context.addOnRemoveCallbacks(callbacks);
      return el;
   });
