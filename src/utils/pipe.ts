import type { FD } from './_elementUpdater';
import { FunctionsList, _pipe, _pipeAsync } from './_pipe';

export const pipe = (...functions: FunctionsList): ((el: () => FD.Element) => FD.Element) => {
   return (el) => _pipe(el(), functions);
};

export const pipeAsync = (
   ...functions: FunctionsList
): ((el: () => FD.Element) => Promise<FD.Element>) => {
   return (el) => _pipeAsync(el(), functions);
};
