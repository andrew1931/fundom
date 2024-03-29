import { IObservableState, isObservable } from '../observable/observableState';
import type { FD } from './_elementUpdater';

export const _stringArgsUpdater = (
   el: FD.Element,
   content: (any | IObservableState<any>)[],
   cb: (val: string) => void,
) => {
   let output: any[] = [];
   const updateFn = (): void => {
      cb(output.join(''));
   };
   content.forEach((item, index) => {
      if (isObservable(item)) {
         output.push((item as IObservableState<any>).current);
         (item as IObservableState<any>).subscribe((val) => {
            output[index] = val;
            updateFn();
         }, el);
      } else {
         output.push(item);
      }
   });
   updateFn();
};
