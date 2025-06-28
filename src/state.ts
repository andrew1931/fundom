import { _isFunction, FN_TYPE, FN_TYPE_STATE_GETTER } from './_utils';
import type {
   FunState,
   FunStateAction,
   FunStateGetterOptions,
   FunStateSetterCallback,
   FunStateSetterOptions,
   FunStateSub,
} from './types';

export const funState: FunState = <T>(initialValue: T) => {
   const subs: [FunStateSub<T>, FunStateGetterOptions][] = [];
   const pausedSubs: FunStateSub<T>[] = [];
   let value: T = initialValue;

   const subIndex = (sub: FunStateSub<T>): number => {
      return subs.findIndex(([_sub]) => _sub === sub);
   };

   /*
    * @description pauses provided subscriber or all subscribers if no arguments provided
    **/
   const pause = (sub?: FunStateSub<T>) => {
      if (sub) {
         if (subIndex(sub) === -1) {
            console.warn('[funState] no such subscriber to pause: ', sub);
            return;
         }
         if (pausedSubs.indexOf(sub) === -1) {
            pausedSubs.push(sub);
         } else {
            console.warn(`[funState] ignore pause of ${sub} as it is already paused`);
         }
      } else {
         for (const _sub of subs) {
            if (pausedSubs.indexOf(_sub[0]) === -1) {
               pausedSubs.push(_sub[0]);
            }
         }
      }
   };

   /*
    * @description resumes provided subscriber or all subscribers if no arguments provided
    **/
   const resume = (sub?: FunStateSub<T>) => {
      if (sub) {
         if (subIndex(sub) === -1) {
            console.warn('[funState] no such subscriber to pause: ', sub);
            return;
         }
         const index = pausedSubs.indexOf(sub);
         if (index > -1) {
            pausedSubs.splice(index, 1);
         } else {
            console.warn(`[funState] ignore resume of ${sub} as it is not paused`);
         }
      } else {
         pausedSubs.length = 0;
      }
   };

   /*
    * @description unsubscribes provided subscriber or all subscribers if no arguments provided and invokes release effects
    **/
   const release = (sub?: FunStateSub<T>): void => {
      if (sub) {
         const index = subIndex(sub);
         if (index > -1) {
            const removed = subs.splice(index, 1);
            if (removed[0]) {
               const options = removed[0][1];
               if (_isFunction(options.releaseEffect)) {
                  options.releaseEffect();
               }
            }
         } else {
            console.warn('[funState] no such subscriber to release: ', sub);
         }
      } else {
         subs.forEach((item) => {
            if (_isFunction(item[1].releaseEffect)) {
               item[1].releaseEffect();
            }
         });
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
            console.warn(`[funState] unknown action ${action} provided`);
            break;
      }
   };

   /*
    * @description returns current value, can be used to add subscriber with release effect
    **/
   const getter = (sub?: FunStateSub<T>, options?: FunStateGetterOptions): T => {
      if (sub) {
         if (_isFunction(sub)) {
            const usePush = subIndex(sub) === -1;
            if (usePush) {
               subs.push([sub, options || {}]);
            }
         } else {
            console.warn('[funState] provided value is not a function: ', sub);
         }
      }
      return value;
   };
   getter[FN_TYPE] = FN_TYPE_STATE_GETTER;

   /*
    * @description updates current value, can be used to control subscribers' reactivity if callback is provided instead of new value
    **/
   const setter = (arg: T | FunStateSetterCallback<T>, options?: FunStateSetterOptions): void => {
      if (_isFunction(arg)) {
         (arg as FunStateSetterCallback<T>)(controller);
      } else {
         const setNextValue = () => {
            value = arg as T;
            subs.forEach(([sub, { once }]) => {
               if (pausedSubs.indexOf(sub) === -1) {
                  sub(value);
                  if (once) {
                     release(sub);
                  }
               }
            });
         };

         if (options && options.force) {
            setNextValue();
         } else {
            if (!Object.is(arg, value)) {
               setNextValue();
            }
         }
      }
   };

   return [getter, setter];
};
