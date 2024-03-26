import { IObservableState, isObservable } from '../observable';
import { elementUpdater } from './_elementUpdater';

export const renderWhen = <T extends HTMLElement>(value: IObservableState<any>) =>
   elementUpdater<T>((el) => {
      let parent: ParentNode | null = null;
      let clone: Node | null;
      const updateDisplay = (val: any) => {
         if (!parent) {
            parent = el.parentNode;
         }
         if (parent) {
            if (val) {
               parent.appendChild(clone || el);
            } else {
               clone = parent.removeChild(clone || el);
            }
         }
      };
      if (isObservable(value)) {
         value.subscribeImmediate((val) => {
            updateDisplay(val);
         });
      } else {
         console.warn('[renderWhen]: provided value is not instanceof ObservableState');
      }
   });
