import { _createElement } from './_common';
import { _PipeContext } from './_context';
import { type FD } from './_elementUpdater';

type FunctionsListItem = FD.ElementUpdater | FD.ElementUpdaterAsync;

export type FunctionsList = FunctionsListItem[];

let findFirstAsyncFunction = (functions: FunctionsList): number => {
   const AsyncFunction = (async () => {}).constructor;
   for (let [index, fn] of functions.entries()) {
      if (fn instanceof AsyncFunction) {
         return index;
      }
   }
   return functions.length;
};

export const _pipe = (element: string | FD.Element, functions: FunctionsList): FD.Element => {
   let el = _createElement(element);

   let context = _PipeContext.create(el);

   let firstAsyncFnIndex = findFirstAsyncFunction(functions);

   for (let i = 0; i < firstAsyncFnIndex; i++) {
      el = (functions[i] as FD.ElementUpdater)(el, context);
   }

   setTimeout(async () => {
      for (let i = firstAsyncFnIndex; i < functions.length; i++) {
         const res = (functions[i] as FunctionsListItem)(el, context);
         if (res instanceof Promise) {
            el = await res;
         } else {
            el = res;
         }
      }
   }, 0);

   return el;
};
