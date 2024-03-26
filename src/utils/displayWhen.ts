import { IObservableState, isObservable } from '../observable';
import { elementUpdater } from './_elementUpdater';

export const displayWhen = <T extends HTMLElement>(value: IObservableState<any>) =>
   elementUpdater<T>((el) => {
      const initialDisplay = el.style.display;
      const updateDisplay = (val: any) => {
         el.style.display = val ? initialDisplay : 'none';
      };
      if (isObservable(value)) {
         value.subscribeImmediate((val) => {
            updateDisplay(val);
         });
      } else {
         console.warn('[displayWhen]: provided value is not instanceof ObservableState');
      }
   });
