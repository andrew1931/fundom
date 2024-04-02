import { type IObservableState, isObservable } from '../observable/observableState';
import { type FD, _elementUpdater } from './_elementUpdater';

export const map = <D>(
   data: D[] | IObservableState<D[]>,
   childCb: (el: D, index: number) => FD.Element,
) =>
   _elementUpdater((el, context) => {
      if (isObservable(data)) {
         let unsubscribeCb = (data as IObservableState<D[]>).subscribeImmediate((val) => {
            // TODO: implement map for ObservableState input
            console.log(val);
         });
         context.addUnsibscribeCallback(unsubscribeCb);
      } else {
         if (Array.isArray(data)) {
            data.forEach((item, index) => {
               el.appendChild(childCb(item, index));
            });
         } else {
            console.error('[map]: provided argument is not an array: ', data);
         }
      }
      return el;
   });
