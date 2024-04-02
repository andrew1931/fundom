import { type IObservableState } from '../observable/observableState';
import { _elementUpdater } from './_elementUpdater';
import { _stringArgsUpdater } from './_stringArgsUpdater';

export const classList = (...content: ((string | number) | IObservableState<string | number>)[]) =>
   _elementUpdater((el, context) => {
      _stringArgsUpdater(context, content, (val: string) => {
         el.setAttribute('class', val);
      });
      return el;
   });
