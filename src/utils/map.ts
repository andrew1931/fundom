import { IObservableState, ObservableState } from '../observable';
import { elementUpdater } from './_elementUpdater';

export const map = <T extends HTMLElement, C extends HTMLElement, D>(
   data: D[] | IObservableState<D[]>,
   childCb: (el: D, index: number) => C,
) =>
   elementUpdater<T>((el) => {
      if (data instanceof ObservableState) {
         data.subscribe((val) => {
            // TODO: implement forEach for ObservableState input
            console.log(val);
         });
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