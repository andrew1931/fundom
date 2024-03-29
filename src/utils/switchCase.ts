import { IObservableState, isObservable } from '../observable/observableState';
import { type FD, elementUpdater } from './_elementUpdater';

export const switchCase = <V>(
   value: V | IObservableState<V>,
   cases: Array<[predicate: (value: V) => boolean, element: FD.Element]>,
) =>
   elementUpdater((el) => {
      const handleCases = (val: V): void => {
         for (let [predicate, element] of cases) {
            if (predicate(val)) {
               el.appendChild(element);
               break;
            }
         }
      };
      if (isObservable(value)) {
         (value as IObservableState<V>).subscribe((val) => {
            handleCases(val);
         }, el);
      } else {
         handleCases(value as V);
      }
   });
