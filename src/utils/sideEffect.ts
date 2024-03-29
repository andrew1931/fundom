import { elementUpdater } from './_elementUpdater';

export const sideEffect = <T extends HTMLElement>(cb: (el: T) => void) =>
   elementUpdater<T>((el) => {
      cb(el);
   });
