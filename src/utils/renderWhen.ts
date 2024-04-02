import { type IObservableState, isObservable } from '../observable/observableState';
import { _elementUpdater } from './_elementUpdater';
import { _observeElementInitialAppear } from './_observeElementInitalAppear';

export const renderWhen = (value: IObservableState<boolean> | boolean) =>
   _elementUpdater((el, context) => {
      let currentEl: HTMLElement | Comment = el;
      let placeholderEl: Comment = new Comment('');
      const update = (val: boolean) => {
         if (val) {
            currentEl.replaceWith(el);
            currentEl = el;
         } else {
            currentEl.replaceWith(placeholderEl);
            currentEl = placeholderEl;
         }
      };
      _observeElementInitialAppear(el, () => {
         if (isObservable(value)) {
            let unsubscribeCb = (value as IObservableState<boolean>).subscribeImmediate((val) => {
               update(val);
            });
            context.addUnsibscribeCallback(unsubscribeCb);
         } else {
            update(value as boolean);
         }
      });
      return el;
   });
