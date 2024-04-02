import { type IObservableState, isObservable } from '../observable/observableState';
import { _replaceOrAppend } from './_common';
import { type FD, _elementUpdater } from './_elementUpdater';

export const ifElse =
   <V>(predicate: (val: V) => boolean, firstElement: FD.Element, secondElement: FD.Element) =>
   (value: V | IObservableState<V>) =>
      _elementUpdater((el, context) => {
         let lastAddedElement: FD.Element | undefined = undefined;

         const handleIf = (val: V): void => {
            if (predicate(val)) {
               lastAddedElement = _replaceOrAppend(firstElement, el, lastAddedElement);
            } else {
               _replaceOrAppend(secondElement, el, lastAddedElement);
            }
         };

         if (isObservable(value)) {
            let unsubscribeCb = (value as IObservableState<V>).subscribeImmediate((val) => {
               handleIf(val);
            });
            context.addUnsibscribeCallback(unsubscribeCb);
         } else {
            handleIf(value as V);
         }
         return el;
      });
