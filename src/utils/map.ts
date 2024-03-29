import { IObservableState, isObservable } from '../observable/observableState';
import { type FD, elementUpdater } from './_elementUpdater';

export const map = <D>(
   data: D[] | IObservableState<D[]>,
   childCb: (el: D, index: number) => FD.Element,
) =>
   elementUpdater((el) => {
      if (isObservable(data)) {
         (data as IObservableState<D[]>).subscribe((val) => {
            // TODO: implement map for ObservableState input
            console.log(val);
         }, el);
      } else {
         if (Array.isArray(data)) {
            data.forEach((item, index) => {
               el.appendChild(childCb(item, index));
            });
         } else {
            console.error('[map]: provided argument is not an array: ', data);
         }
      }
   });
