import { IObservableState, isObservable } from '../observable';
import { elementUpdater } from './_elementUpdater';

type StyleInput =
   | Record<string, (string | number) | IObservableState<string | number>>
   | IObservableState<Record<string, string | number>>;

export const style = <T extends HTMLElement>(styles: StyleInput) =>
   elementUpdater<T>((el) => {
      const updateStyle = (key: string, val: string | number) => {
         // @ts-ignore have a contract that key is valid style property
         el.style[key] = val;
      };
      if (isObservable(styles)) {
         (styles as IObservableState<Record<string, string | number>>).subscribe(
            (values: Record<string, string | number>) => {
               Object.entries(values).forEach(([key, value]) => {
                  updateStyle(key, value);
               });
            },
         );
      } else {
         Object.entries(styles).forEach(([key, value]) => {
            if (isObservable(value)) {
               (value as IObservableState<string | number>).subscribeImmediate((val) => {
                  updateStyle(key, val);
               });
            } else {
               updateStyle(key, value as string | number);
            }
         });
      }
   });
