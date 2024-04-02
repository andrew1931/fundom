import { type IPipeContext } from './_context';

export namespace FD {
   export interface Element extends HTMLElement {}
   export type ElementUpdater = (el: FD.Element, context: IPipeContext) => FD.Element;
   export type ElementUpdaterAsync = (el: FD.Element, context: IPipeContext) => Promise<FD.Element>;
}

export const _elementUpdater = (updaterFn: FD.ElementUpdater): FD.ElementUpdater => {
   return updaterFn;
};

export const _elementUpdaterAsync = (updaterFn: FD.ElementUpdaterAsync): FD.ElementUpdaterAsync => {
   return async (el, context) => {
      return await updaterFn(el, context);
   };
};
