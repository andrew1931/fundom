import { type IObservableState, isObservable } from '../observable/observableState';
import { _elementUpdater } from './_elementUpdater';

type AttrInput =
   | Record<string, string | IObservableState<string>>
   | IObservableState<Record<string, string>>;

export const attr = (attributes: AttrInput) =>
   _elementUpdater((el, context) => {
      const updateAttribute = (key: string, val: string) => {
         el.setAttribute(key, val);
      };
      if (isObservable(attributes)) {
         let unsubscribeCb = (attributes as IObservableState<Record<string, string>>).subscribe(
            (attr: Record<string, string>) => {
               Object.entries(attr).forEach(([key, value]) => {
                  updateAttribute(key, value);
               });
            },
         );
         context.addUnsibscribeCallback(unsubscribeCb);
      } else {
         Object.entries(attributes).forEach(([key, value]) => {
            if (isObservable(value)) {
               let unsubscribeCb = (value as IObservableState<string>).subscribeImmediate((val) => {
                  updateAttribute(key, val);
               });
               context.addUnsibscribeCallback(unsubscribeCb);
            } else {
               updateAttribute(key, value as string);
            }
         });
      }
      return el;
   });
