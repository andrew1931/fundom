import { _isFunction, FN_TYPE, FN_TYPE_STATE_GETTER } from './_utils';
import type {
   FunState,
   FunStateAction,
   FunStateOnReleaseEffect,
   FunStateSetterCallback,
   FunStateSub,
} from './types';

export const funState: FunState = <T>(initialValue: T) => {
   const subs: [FunStateSub<T>, FunStateOnReleaseEffect][] = [];
   const pausedSubs: FunStateSub<T>[] = [];
   let value: T = initialValue;

   const subExists = (sub: FunStateSub<T>) => {
      return subs.findIndex(([_sub]) => _sub === sub) > -1;
   };

   const pause = (sub?: FunStateSub<T>) => {
      if (sub) {
         if (!subExists(sub)) {
            console.warn('[funState] no such subscriber to pause: ', sub);
            return;
         }
         if (pausedSubs.indexOf(sub) === -1) {
            pausedSubs.push(sub);
         } else {
            console.warn(`ignore pause of ${sub} as it is already paused`);
         }
      } else {
         for (const _sub of subs) {
            if (pausedSubs.indexOf(_sub[0]) === -1) {
               pausedSubs.push(_sub[0]);
            }
         }
      }
   };

   const resume = (sub?: FunStateSub<T>) => {
      if (sub) {
         if (!subExists(sub)) {
            console.warn('[funState] no such subscriber to pause: ', sub);
            return;
         }
         const index = pausedSubs.indexOf(sub);
         if (index > -1) {
            pausedSubs.splice(index, 1);
         } else {
            console.warn(`ignore resume of ${sub} as it is not paused`);
         }
      } else {
         pausedSubs.length = 0;
      }
   };

   const release = (sub?: FunStateSub<T>): void => {
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

   const controller = (action: FunStateAction, sub?: FunStateSub<T>) => {
      switch (action) {
         case 'pause':
            pause(sub);
            break;
         case 'resume':
            resume(sub);
            break;
         case 'release':
            release(sub);
            break;
         default:
            console.warn(`unknown action ${action} provided`);
            break;
      }
   };

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

   const setter = (arg: T | FunStateSetterCallback<T>): void => {
      if (_isFunction(arg)) {
         (arg as FunStateSetterCallback<T>)(controller);
      } else {
         if (!Object.is(arg, value)) {
            value = arg as T;
            subs.forEach(([sub]) => {
               if (pausedSubs.indexOf(sub) === -1) {
                  sub(value);
               }
            });
         }
      }
   };

   return [getter, setter];
};

const [g, s] = funState(0);

s((f) => f('pause'))