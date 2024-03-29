import { FunctionsList, _pipe, _pipeAsync } from './_pipe';

export const pipe = <T extends HTMLElement>(
   ...functions: FunctionsList<T>
): ((el: () => T) => T) => {
   return (el) => _pipe(el(), functions);
};

export const pipeAsync = <T extends HTMLElement>(
   ...functions: FunctionsList<T>
): ((el: () => T) => Promise<T>) => {
   return (el) => _pipeAsync(el(), functions);
};
