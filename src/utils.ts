export const useFunDomDebug$ = (() => {
   let use = false;
   return (value?: boolean) => {
      if (value !== undefined && typeof value === 'boolean') {
         use = value;
      }
      return use;
   }
})();