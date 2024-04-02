import { _createElement } from './_common';
import { type IPipeContext, _PipeContext } from './_context';
import { type FD } from './_elementUpdater';
import { pipe } from './pipe';

export const context = (
   pipeCb: (context: IPipeContext) => ReturnType<typeof pipe>,
): ((element: string | FD.Element) => FD.Element) => {
   return (element) => {
      let el = _createElement(element);
      const context = _PipeContext.create(el);
      return pipeCb(context)(el);
   };
};
