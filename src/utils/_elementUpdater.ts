export const elementUpdater = <T extends HTMLElement>(cb: (value: T) => void): ((el: T) => T) => {
   return (el) => {
      cb(el);
      return el;
   };
};

export const elementUpdaterAsync = <T extends HTMLElement>(
   cb: (value: T) => Promise<T>,
): ((el: T) => Promise<T>) => {
   return async (el) => {
      await cb(el);
      return el;
   };
};
