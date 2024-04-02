import { type FD, _elementUpdater } from './_elementUpdater';

export const children = (...content: FD.Element[]) =>
   _elementUpdater((el) => {
      el.append(...content);
      return el;
   });
