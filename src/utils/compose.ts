import { FunctionsList, _pipe, _pipeAsync } from './_pipe';

export const compose = <T extends HTMLElement>(
   ...functions: FunctionsList<T>
): ((el: () => T) => T) => {
   return (el) => _pipe(el(), functions.reverse());
};

export const composeAsync = <T extends HTMLElement>(
   ...functions: FunctionsList<T>
): ((el: () => T) => Promise<T>) => {
   return (el) => _pipeAsync(el(), functions.reverse());
};
