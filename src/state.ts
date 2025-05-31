import { _isFunction, FN_TYPE, FN_TYPE_STATE_GETTER } from './_utils';
import type { FunState, FunStateOnReleaseEffect, FunStateSub } from './types';

export const funState: FunState = <T>(initialValue: T) => {
   const subs: [FunStateSub<T>, FunStateOnReleaseEffect][] = [];
   let value: T = initialValue;

   const getter = (sub?: FunStateSub<T>, releaseEffect?: FunStateOnReleaseEffect): T => {
      if (sub !== undefined) {
         if (_isFunction(sub)) {
            if (releaseEffect !== undefined) {
               if (_isFunction(releaseEffect)) {
                  subs.push([sub, releaseEffect]);
               } else {
                  console.warn('[funState] provided value is not a function: ', releaseEffect);
               }
            } else {
               subs.push([sub, () => {}]);
            }
         } else {
            console.warn('[funState] provided value is not a function: ', sub);
         }
      }
      return value;
   };
   getter[FN_TYPE] = FN_TYPE_STATE_GETTER;

   const setter = (nextValue: T): void => {
      if (!Object.is(nextValue, value)) {
         value = nextValue;
         subs.forEach(([sub]) => sub(value));
      }
   };

   const releaser = (sub?: FunStateSub<T>): void => {
      if (sub !== undefined) {
         const index = subs.findIndex(([_sub]) => _sub === sub);
         if (index > -1) {
            const removed = subs.splice(index, 1);
            removed.forEach((item) => item[1]());
         } else {
            console.warn('[funState] no such subscriber: ', sub);
         }
      } else {
         subs.forEach((item) => item[1]());
         subs.length = 0;
      }
   };

   return [getter, setter, releaser];
};
