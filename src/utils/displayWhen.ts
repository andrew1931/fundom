import { type IObservableState, isObservable } from '../observable/observableState';
import { _elementUpdater } from './_elementUpdater';

export const displayWhen = (value: IObservableState<boolean> | boolean) =>
   _elementUpdater((el, context) => {
      const initialDisplay = el.style.display;
      const update = (val: boolean) => {
         el.style.setProperty('display', val ? initialDisplay : 'none');
      };
      if (isObservable(value)) {
         let unsubscribeCb = (value as IObservableState<boolean>).subscribeImmediate((val) => {
            update(val);
         });
         context.addUnsubscribeCallback(unsubscribeCb);
      } else {
         update(value as boolean);
      }
      return el;
   });
