import { type IObservableState, isObservable } from '../observable/observableState';
import { _elementUpdater } from './_elementUpdater';

type StyleValue = string | (() => string) | [setter: () => string, deps: IObservableState<any>[]];

type StyleInput =
   | Record<string, StyleValue | IObservableState<StyleValue>>
   | IObservableState<Record<string, StyleValue>>;

const WRONG_ARRAY_TYPE_ERROR =
   'style value of Array type should have setter function as first argument and array of ObservableStates as a second';

export const style = (styles: StyleInput) =>
   _elementUpdater((el, context) => {
      const updateStyle = (key: string, val: StyleValue) => {
         const updater = (primitiveVal: string) => el.style.setProperty(key, primitiveVal);

         if (Array.isArray(val)) {
            if (val.length !== 2) {
               console.error(WRONG_ARRAY_TYPE_ERROR);
            } else {
               if (Array.isArray(val[1]) && typeof val[0] === 'function') {
                  val[1].forEach((dep) => {
                     let unsubscribeCb = dep.subscribe(() => updater(val[0]()));
                     context.addUnsubscribeCallback(unsubscribeCb);
                  });
               } else {
                  console.error(WRONG_ARRAY_TYPE_ERROR);
               }
            }
         } else if (typeof val === 'function') {
            const res = val();
            updater(res);
         } else {
            updater(val);
         }
      };
      if (isObservable(styles)) {
         let unsubscribeCb = (styles as IObservableState<Record<string, string>>).subscribe(
            (values: Record<string, string>) => {
               Object.entries(values).forEach(([key, value]) => {
                  updateStyle(key, value);
               });
            },
         );
         context.addUnsubscribeCallback(unsubscribeCb);
      } else {
         Object.entries(styles).forEach(([key, value]) => {
            if (isObservable(value)) {
               let unsubscribeCb = (value as IObservableState<string>).subscribeImmediate((val) => {
                  updateStyle(key, val);
               });
               context.addUnsubscribeCallback(unsubscribeCb);
            } else {
               updateStyle(key, value as string);
            }
         });
      }
      return el;
   });
