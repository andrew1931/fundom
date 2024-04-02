import { type FD, _elementUpdater } from './_elementUpdater';

export const sideEffect = (cb: (el: FD.Element) => void) =>
   _elementUpdater((el) => {
      cb(el);
      return el;
   });
