import { IObservableState, isObservable } from '../observable/observableState';

export const _stringArgsUpdater = <T extends HTMLElement>(
   el: T,
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
