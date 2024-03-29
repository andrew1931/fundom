import { type FD, elementUpdater } from './_elementUpdater';

export const children = (...content: FD.Element[]) =>
   elementUpdater((el) => {
      el.append(...content);
   });
