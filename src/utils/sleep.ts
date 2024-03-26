import { elementUpdaterAsync } from './_elementUpdater';

export const sleep = <T extends HTMLElement>(time: number) =>
   elementUpdaterAsync<T>((el) => {
      return new Promise((resolve) => setTimeout(() => resolve(el), time));
   });
