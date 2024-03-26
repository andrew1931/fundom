import { IObservableState, ObservableState } from '../observable';
import { elementUpdater } from './_elementUpdater';

export const displayWhen = <T extends HTMLElement>(value: IObservableState<any>) =>
   elementUpdater<T>((el) => {
      const initialDisplay = el.style.display;
      const updateDisplay = (val: any) => {
         el.style.display = val ? initialDisplay : 'none';
      };
      if (value instanceof ObservableState) {
         value.subscribeImmediate((val) => {
            updateDisplay(val);
         });
      } else {
         console.warn('[displayWhen]: provided value is not instanceof ObservableState');
      }
   });