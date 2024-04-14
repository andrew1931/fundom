import { type IPipeContextPublicApi } from './_context';
import { type FD, _elementUpdater } from './_elementUpdater';
import { _GlobalContext } from './_globalContext';

export const createRef = (refName: string, targetContext?: IPipeContextPublicApi) =>
   _elementUpdater((el, context) => {
      if (targetContext !== undefined) {
         targetContext.addRef(refName, el);
      } else {
         context.addRef(refName, el);
      }
      return el;
   });

export const createGlobalRef = (refName: string) =>
   _elementUpdater((el) => {
      _GlobalContext.addRef(refName, el);
      return el;
   });

export const findGlobalRef = (refName: string, cb: (ref: FD.Element | undefined) => void): void => {
   cb(_GlobalContext.findRef(refName));
};
