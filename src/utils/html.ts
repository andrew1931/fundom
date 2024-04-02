import { type IObservableState } from '../observable/observableState';
import { _elementUpdater } from './_elementUpdater';
import { _stringArgsUpdater } from './_stringArgsUpdater';

export const html = (...content: (any | IObservableState<any>)[]) =>
   _elementUpdater((el, context) => {
      _stringArgsUpdater(context, content, (val: string) => {
         el.innerHTML = val;
      });
      return el;
   });
