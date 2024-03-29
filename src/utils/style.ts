import { IObservableState, isObservable } from '../observable/observableState';
import { elementUpdater } from './_elementUpdater';

type ValuePrimitive = string;

type StyleValue =
   | ValuePrimitive
   | (() => ValuePrimitive)
   | [setter: () => ValuePrimitive, deps: IObservableState<any>[]];

type StyleInput =
   | Record<string, StyleValue | IObservableState<StyleValue>>
   | IObservableState<Record<string, StyleValue>>;

const WRONG_ARRAY_TYPE_ERROR =
   'style value of Array type should have setter function as first argument and array of ObservableStates as a second';

export const style = <T extends HTMLElement>(styles: StyleInput) =>
   elementUpdater<T>((el) => {
      const updateStyle = (key: string, val: StyleValue) => {
         const updater = (primitiveVal: ValuePrimitive) => el.style.setProperty(key, primitiveVal);

         if (Array.isArray(val)) {
            if (val.length !== 2) {
               console.error(WRONG_ARRAY_TYPE_ERROR);
            } else {
               if (Array.isArray(val[1]) && typeof val[0] === 'function') {
                  val[1].forEach((dep) => {
                     dep.subscribe(() => updater(val[0]()), el);
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
         (styles as IObservableState<Record<string, ValuePrimitive>>).subscribe(
            (values: Record<string, ValuePrimitive>) => {
               Object.entries(values).forEach(([key, value]) => {
                  updateStyle(key, value);
               });
            },
            el,
         );
      } else {
         Object.entries(styles).forEach(([key, value]) => {
            if (isObservable(value)) {
               (value as IObservableState<ValuePrimitive>).subscribeImmediate((val) => {
                  updateStyle(key, val);
               }, el);
            } else {
               updateStyle(key, value as ValuePrimitive);
            }
         });
      }
   });
