import { type IObservableState, isObservable } from '../observable/observableState';
import { _replaceOrAppend } from './_common';
import { type FD, _elementUpdater } from './_elementUpdater';

export const matchCase = <V>(
   predicate: (value: V) => boolean,
   element: FD.Element,
): ((val: V) => FD.Element | undefined) => {
   return (val) => {
      if (predicate(val)) {
         return element;
      }
      return undefined;
   };
};

export const defaultCase = (element: FD.Element): (() => FD.Element | undefined) => {
   return () => {
      return element;
   };
};

export const switchCase =
   <V>(...cases: Array<ReturnType<typeof matchCase<V> | typeof defaultCase>>) =>
   (value: V | IObservableState<V>) =>
      _elementUpdater((el, context) => {
         let lastAddedElement: FD.Element | undefined = undefined;

         const handleCases = (val: V): void => {
            for (let caseItem of cases) {
               let element = caseItem(val);
               if (element) {
                  lastAddedElement = _replaceOrAppend(element, el, lastAddedElement);
                  break;
               }
            }
         };

         if (isObservable(value)) {
            let unsubscribeCb = (value as IObservableState<V>).subscribeImmediate((val) => {
               handleCases(val);
            });
            context.addUnsibscribeCallback(unsubscribeCb);
         } else {
            handleCases(value as V);
         }
         return el;
      });
