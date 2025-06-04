import { _isFunction, FN_TYPE, FN_TYPE_STATE_GETTER } from './_utils';
import type { FunState, FunStateOnReleaseEffect, FunStateSub } from './types';

export const funState: FunState = <T>(initialValue: T) => {
   const subs: [FunStateSub<T>, FunStateOnReleaseEffect][] = [];
   const pausedSubs: FunStateSub<T>[] = [];
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
         subs.forEach(([sub]) => {
            if (pausedSubs.indexOf(sub) === -1) {
               sub(value);
            }
         });
      }
   };

   const pauserResumer = (sub?: FunStateSub<T>) => {
      if (sub) {
         const subIndex = subs.findIndex(([_sub]) => _sub === sub);
         if (subIndex === -1) {
            console.warn('[funState] no such subscriber to pause: ', sub);
            return;
         }
         const index = pausedSubs.indexOf(sub);
         if (index > -1) {
            pausedSubs.splice(index, 1);
         } else {
            pausedSubs.push(sub);
         }
      } else {
         if (pausedSubs.length < subs.length) {
            for (const _sub of subs) {
               if (pausedSubs.indexOf(_sub[0]) === -1) {
                  pausedSubs.push(_sub[0]);
               }
            }
         } else {
            pausedSubs.length = 0;
         }
      }
   };

   const releaser = (sub?: FunStateSub<T>): void => {
      if (sub) {
         const index = subs.findIndex(([_sub]) => _sub === sub);
         if (index > -1) {
            const removed = subs.splice(index, 1);
            removed.forEach((item) => item[1]());
         } else {
            console.warn('[funState] no such subscriber to release: ', sub);
         }
      } else {
         subs.forEach((item) => item[1]());
         subs.length = 0;
      }
   };

   return [getter, setter, pauserResumer, releaser];
};
