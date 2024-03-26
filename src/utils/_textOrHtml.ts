import { IObservableState, isObservable } from '../observable';
import { elementUpdater } from './_elementUpdater';

export const textOrHtml =
   (targetMethod: 'innerHTML' | 'innerText') =>
   <T extends HTMLElement>(...content: (any | IObservableState<any>)[]) =>
      elementUpdater<T>((el) => {
         let result: any[] = [];
         const updateText = () => (el[targetMethod] = result.join(''));
         content.forEach((item, index) => {
            if (isObservable(item)) {
               result.push((item as IObservableState<any>).current);
               (item as IObservableState<any>).subscribe((val) => {
                  result[index] = val;
                  updateText();
               });
            } else {
               result.push(item);
            }
         });
         updateText();
      });
