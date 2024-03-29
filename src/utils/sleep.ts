import { elementUpdaterAsync } from './_elementUpdater';

export const sleep = (time: number) =>
   elementUpdaterAsync((el) => {
      return new Promise((resolve) => setTimeout(() => resolve(el), time));
   });
