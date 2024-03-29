import { IObservableState } from '../observable/observableState';
import { elementUpdater } from './_elementUpdater';
import { _stringArgsUpdater } from './_stringArgsUpdater';

export const text = (...content: (any | IObservableState<any>)[]) =>
   elementUpdater((el) => {
      _stringArgsUpdater(el, content, (val: string) => {
         el.innerText = val;
      });
   });
