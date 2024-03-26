import { elementUpdater, elementUpdaterAsync } from './_elementUpdater';

export const composeOrPipeAsync =
   (direction: 1 | -1) =>
   <T extends HTMLElement>(
      ...functions: ReturnType<typeof elementUpdater<T> | typeof elementUpdaterAsync<T>>[]
   ): ((el: () => T) => Promise<T>) => {
      return async (el) => {
         let _el = el();
         const targetArray = direction === 1 ? functions : functions.reverse();
         for await (const fn of targetArray) {
            const res = fn(_el);
            if (res instanceof Promise) {
               _el = await res;
            } else {
               _el = res;
            }
         }
         return _el;
      };
   };

export const composeOrPipe =
   (direction: 1 | -1) =>
   <T extends HTMLElement>(
      ...functions: ReturnType<typeof elementUpdater<T>>[]
   ): ((el: () => T) => T) => {
      return (el) => {
         const _el = el();
         const targetMethod = direction === 1 ? 'reduce' : 'reduceRight';
         return functions[targetMethod]((prev, cur) => {
            return cur(prev);
         }, _el);
      };
   };
