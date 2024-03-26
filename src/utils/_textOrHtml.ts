import { IObservableState, ObservableState } from '../observable';
import { elementUpdater } from './_elementUpdater';

export const textOrHtml =
(targetMethod: 'innerHTML' | 'innerText') =>
<T extends HTMLElement>(...content: (any | IObservableState<any>)[]) =>
   elementUpdater<T>((el) => {
      let result: any[] = [];
      const updateText = () => (el[targetMethod] = result.join(''));
      content.forEach((item, index) => {
         if (item instanceof ObservableState) {
            result.push(item.current);
            item.subscribe((val) => {
               result[index] = val;
               updateText();
            });
         } else {
            result.push(item);
         }
      });
      updateText();
   });