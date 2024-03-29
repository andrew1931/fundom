import { IObservableState } from '../observable/observableState';
import { elementUpdater } from './_elementUpdater';
import { _stringArgsUpdater } from './_stringArgsUpdater';

export const html = (...content: (any | IObservableState<any>)[]) =>
   elementUpdater((el) => {
      _stringArgsUpdater(el, content, (val: string) => {
         el.innerHTML = val;
      });
   });
