import { type FD } from './_elementUpdater';
import { type FunctionsList, _pipe } from './_pipe';

export const pipe = (...functions: FunctionsList): ((el: string | FD.Element) => FD.Element) => {
   return (el) => _pipe(el, functions);
};
