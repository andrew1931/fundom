import { IObservableState } from '../observable/observableState';
import { elementUpdater } from './_elementUpdater';
import { _stringArgsUpdater } from './_stringArgsUpdater';

export const html = <T extends HTMLElement>(...content: (any | IObservableState<any>)[]) =>
   elementUpdater<T>((el) => {
      _stringArgsUpdater(el, content, (val: string) => {
         el.innerHTML = val;
      });
   });
