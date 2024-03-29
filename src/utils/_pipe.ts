import { elementUpdater, elementUpdaterAsync } from './_elementUpdater';

export type FunctionsList<T extends HTMLElement> = ReturnType<
   typeof elementUpdater<T> | typeof elementUpdaterAsync<T>
>[];

let hasAsyncFunctions = <T extends HTMLElement>(functions: FunctionsList<T>) => {
   const AsyncFunction = (async () => {}).constructor;
   for (let fn of functions) {
      if (fn instanceof AsyncFunction) {
         return true;
      }
   }
   return false;
};

export const _pipe = <T extends HTMLElement>(el: T, functions: FunctionsList<T>): T => {
   if (hasAsyncFunctions(functions)) {
      setTimeout(async () => {
         for await (const fn of functions) {
            const res = fn(el);
            if (res instanceof Promise) {
               el = await res;
            } else {
               el = res;
            }
         }
      }, 0);
      return el;
   }

   return (functions as ReturnType<typeof elementUpdater<T>>[]).reduce((prev, cur) => {
      return cur(prev);
   }, el);
};

export const _pipeAsync = async <T extends HTMLElement>(
   el: T,
   functions: FunctionsList<T>,
): Promise<T> => {
   for await (const fn of functions) {
      const res = fn(el);
      if (res instanceof Promise) {
         el = await res;
      } else {
         el = res;
      }
   }
   return el;
};
