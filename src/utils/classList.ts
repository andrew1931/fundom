import { IObservableState } from '../observable/observableState';
import { elementUpdater } from './_elementUpdater';
import { _stringArgsUpdater } from './_stringArgsUpdater';

export const classList = <T extends HTMLElement>(...content: (any | IObservableState<any>)[]) =>
   elementUpdater<T>((el) => {
      _stringArgsUpdater(el, content, (val: string) => {
         el.setAttribute('class', val);
      });
   });
