import { elementUpdater } from './_elementUpdater';

export const children = <T extends HTMLElement>(...content: T[]) =>
   elementUpdater<T>((el) => {
      content.forEach((item) => el.appendChild(item));
   });