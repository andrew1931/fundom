import { elementUpdater } from './_elementUpdater';

export const tap = <T extends HTMLElement>(cb: () => void) =>
   elementUpdater<T>(() => {
      cb();
   });