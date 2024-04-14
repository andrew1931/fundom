import { _createElement } from './_common';
import { type IPipeContext, _PipeContext, IPipeContextPublicApi } from './_context';
import { type FD } from './_elementUpdater';
import { pipe } from './pipe';

const mapContextPublicApi = (context: IPipeContext): IPipeContextPublicApi => {
   return {
      addRef: context.addRef,
      findRef: context.findRef,
   };
};

export const context = (
   pipeCb: (context: IPipeContextPublicApi) => ReturnType<typeof pipe>,
): ((element: string | FD.Element) => FD.Element) => {
   return (element) => {
      let el = _createElement(element);
      const context = _PipeContext.create(el);
      return pipeCb(mapContextPublicApi(context))(el);
   };
};
