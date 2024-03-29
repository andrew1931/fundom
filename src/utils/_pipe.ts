import { type FD, elementUpdater, elementUpdaterAsync } from './_elementUpdater';

export type FunctionsList = ReturnType<typeof elementUpdater | typeof elementUpdaterAsync>[];

let hasAsyncFunctions = (functions: FunctionsList): boolean => {
   const AsyncFunction = (async () => {}).constructor;
   for (let fn of functions) {
      if (fn instanceof AsyncFunction) {
         return true;
      }
   }
   return false;
};

export const _pipe = (el: FD.Element, functions: FunctionsList): FD.Element => {
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

   return (functions as ReturnType<typeof elementUpdater>[]).reduce((prev, cur) => {
      return cur(prev);
   }, el);
};

export const _pipeAsync = async (el: FD.Element, functions: FunctionsList): Promise<FD.Element> => {
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
