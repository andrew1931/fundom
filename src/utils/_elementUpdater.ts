export namespace FD {
   export interface Element extends HTMLElement {}
}

export const elementUpdater = (cb: (el: FD.Element) => void): ((el: FD.Element) => FD.Element) => {
   return (el) => {
      cb(el);
      return el;
   };
};

export const elementUpdaterAsync = (
   cb: (el: FD.Element) => Promise<FD.Element>,
): ((el: FD.Element) => Promise<FD.Element>) => {
   return async (el) => {
      await cb(el);
      return el;
   };
};
