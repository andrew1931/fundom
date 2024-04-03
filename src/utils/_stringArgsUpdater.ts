import { type IObservableState, isObservable } from '../observable/observableState';
import { type IPipeContext } from './_context';

export const _stringArgsUpdater = (
   context: IPipeContext,
   content: ((string | number) | IObservableState<string | number>)[],
   cb: (val: string) => void,
) => {
   let output: (string | number)[] = [];
   const updateFn = (): void => {
      cb(output.join(''));
   };
   content.forEach((item, index) => {
      if (isObservable(item)) {
         output.push((item as IObservableState<string | number>).current);
         let unsubscribeCb = (item as IObservableState<string | number>).subscribe((val) => {
            output[index] = val;
            updateFn();
         });
         context.addUnsubscribeCallback(unsubscribeCb);
      } else {
         output.push(item as string | number);
      }
   });
   updateFn();
};
