import { _elementUpdaterAsync } from './_elementUpdater';

export const sleep = (time: number) =>
   _elementUpdaterAsync((el) => {
      return new Promise((resolve) => setTimeout(() => resolve(el), time));
   });
