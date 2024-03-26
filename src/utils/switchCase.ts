import { IObservableState, isObservable } from '../observable';
import { elementUpdater } from './_elementUpdater';

export const switchCase = <T extends HTMLElement, C extends HTMLElement, V>(
   value: V | IObservableState<V>,
   cases: Array<[predicate: (value: V) => boolean, element: C]>,
) =>
   elementUpdater<T>((el) => {
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
         });
      } else {
         handleCases(value as V);
      }
   });
