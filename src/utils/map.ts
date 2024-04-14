import { type IObservableState, isObservable } from '../observable/observableState';
import { _uniqueNumber } from './_common';
import { MappedElementsItemValue } from './_context';
import { type FD, _elementUpdater } from './_elementUpdater';

export const trackByKey = (key: string) => () => key;

export const map = <D extends Record<string, any>>(
   data: D[] | IObservableState<D[]>,
   childCb: (el: D, index: number) => FD.Element,
   trackBy?: ReturnType<typeof trackByKey>,
) =>
   _elementUpdater((el, context) => {
      if (isObservable(data)) {
         let id = Symbol('MappedItems');
         let unsubscribeCb = (data as IObservableState<D[]>).subscribeImmediate((val: D[]) => {
            let updateId = _uniqueNumber();
            for (let [index, item] of val.entries()) {
               let trackKey = index;
               if (trackBy) {
                  if (trackBy() in item) {
                     trackKey = item[trackBy()];
                  } else {
                     console.warn(
                        '[map]: item does not have ' +
                           trackBy() +
                           ' key inside, index is used as a fallback',
                     );
                  }
               }

               let updatePrevValue = (value: MappedElementsItemValue): void => {
                  context.updateMappedElementsItem(id, trackKey, value);
               };

               let prevItem = context.getMappedElementsItem(id, trackKey);
               if (!prevItem) {
                  // append new items to context and DOM
                  let child = childCb(item, index);
                  el.appendChild(child);
                  updatePrevValue([item, child, updateId]);
               } else {
                  if (prevItem[0] !== item) {
                     // replace new items in context and DOM
                     let child = childCb(item, index);
                     prevItem[1].replaceWith(child);
                     updatePrevValue([item, child, updateId]);
                  } else {
                     updatePrevValue([prevItem[0], prevItem[1], updateId]);
                  }
               }
            }
            // remove outdated items from context and DOM
            for (let [key, item] of context.getMappedElementsItemEntries(id)) {
               if (item[2] !== updateId) {
                  item[1].remove();
                  context.deleteMappedElementsItem(id, key);
               }
            }
         });
         context.addUnsubscribeCallback(unsubscribeCb);
      } else {
         if (Array.isArray(data)) {
            data.forEach((item, index) => {
               el.appendChild(childCb(item, index));
            });
         } else {
            console.error('[map]: provided argument is not an array: ', data);
         }
      }
      return el;
   });
