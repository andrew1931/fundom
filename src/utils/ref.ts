import { _GlobalContext, IPipeContext } from './_context';
import { type FD, _elementUpdater } from './_elementUpdater';

export const createRef = (refName: string, targetContext?: IPipeContext) =>
   _elementUpdater((el, context) => {
      if (targetContext !== undefined) {
         targetContext.addRef(refName, el);
      } else {
         context.addRef(refName, el);
      }
      return el;
   });

export const findRef = (
   refName: string,
   cb: (ref: FD.Element | undefined) => void,
   targetContext?: IPipeContext,
) =>
   _elementUpdater((el, context) => {
      if (targetContext !== undefined) {
         cb(targetContext.findRef(refName));
      } else {
         cb(context.findRef(refName));
      }
      return el;
   });

export const createGlobalRef = (refName: string) =>
   _elementUpdater((el) => {
      _GlobalContext.addRef(refName, el);
      return el;
   });

export const findGlobalRef = (refName: string, cb: (ref: FD.Element | undefined) => void) =>
   _elementUpdater((el) => {
      cb(_GlobalContext.findRef(refName));
      return el;
   });
