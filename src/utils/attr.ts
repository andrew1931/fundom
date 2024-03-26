import { IObservableState, ObservableState } from '../observable';
import { elementUpdater } from './_elementUpdater';

type AttrInput =
   | Record<string, string | IObservableState<string>>
   | IObservableState<Record<string, string>>;

export const attr = <T extends HTMLElement>(attributes: AttrInput) =>
   elementUpdater<T>((el) => {
      const updateAttribute = (key: string, val: string) => {
         el.setAttribute(key, val);
      };
      if (attributes instanceof ObservableState) {
         attributes.subscribe((attr: Record<string, string>) => {
            Object.entries(attr).forEach(([key, value]) => {
               updateAttribute(key, value);
            });
         });
      } else {
         Object.entries(attributes).forEach(([key, value]) => {
            if (value instanceof ObservableState) {
               value.subscribeImmediate((val) => {
                  updateAttribute(key, val);
               });
            } else {
               updateAttribute(key, value as string);
            }
         });
      }
   });