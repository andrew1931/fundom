import { IObservableState, isObservable } from '../observable/observableState';
import { elementUpdater } from './_elementUpdater';

export const id = <T extends HTMLElement>(value: string | IObservableState<string>) =>
   elementUpdater<T>((el) => {
      const setId = (val: string) => (el.id = val);
      if (isObservable(value)) {
         (value as IObservableState<string>).subscribeImmediate((val: string) => setId(val), el);
      } else {
         setId(value as string);
      }
   });
