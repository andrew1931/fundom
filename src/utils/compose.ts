import type { FD } from './_elementUpdater';
import { FunctionsList, _pipe, _pipeAsync } from './_pipe';

export const compose = (...functions: FunctionsList): ((el: () => FD.Element) => FD.Element) => {
   return (el) => _pipe(el(), functions.reverse());
};

export const composeAsync = (
   ...functions: FunctionsList
): ((el: () => FD.Element) => Promise<FD.Element>) => {
   return (el) => _pipeAsync(el(), functions.reverse());
};
