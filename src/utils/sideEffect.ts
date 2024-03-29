import { type FD, elementUpdater } from './_elementUpdater';

export const sideEffect = (cb: (el: FD.Element) => void) =>
   elementUpdater((el) => {
      cb(el);
   });
