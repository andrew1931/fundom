import { _GlobalContext, type OnRemoveCallback } from './_context';
import { _elementUpdater, type FD } from './_elementUpdater';

const handleRemove = (el: FD.Element): void => {
   _GlobalContext.findContext(el)?.releaseBeforeRemoveCallbacks();
   el.remove();
   _GlobalContext.findContext(el)?.releaseAfterRemoveCallbacks();
};

export const removeAndCleanUp = (el: FD.Element): void => {
   handleRemove(el);
   _GlobalContext.cleanUp(el);
};

export const removeWithoutCleanUp = (el: FD.Element): void => {
   handleRemove(el);
};

export const beforeRemove = (...collbacks: OnRemoveCallback[]) =>
   _elementUpdater((el, context) => {
      context.addBeforeRemoveCallbacks(collbacks);
      return el;
   });

export const afterRemove = (...collbacks: OnRemoveCallback[]) =>
   _elementUpdater((el, context) => {
      context.addAfterRemoveCallbacks(collbacks);
      return el;
   });
