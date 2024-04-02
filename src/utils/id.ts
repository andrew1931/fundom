import { type IObservableState, isObservable } from '../observable/observableState';
import { _elementUpdater } from './_elementUpdater';

export const id = (value: string | IObservableState<string>) =>
   _elementUpdater((el, context) => {
      const setId = (val: string) => (el.id = val);
      if (isObservable(value)) {
         let unsubscribeCb = (value as IObservableState<string>).subscribeImmediate((val: string) =>
            setId(val),
         );
         context.addUnsibscribeCallback(unsubscribeCb);
      } else {
         setId(value as string);
      }
      return el;
   });
