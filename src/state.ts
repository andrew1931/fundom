import { FN_TYPE, FN_TYPE_STATE_GETTER } from './_utils';
import type { FunStateGetter, FunStateSub } from './types';

export const funState = <T>(
   initialValue: T,
): [getterCb: FunStateGetter<T>, setterCb: FunStateSub<T>, releaseCb: () => void] => {
   const subs: FunStateSub<T>[] = [];
   let value: T = initialValue;

   const getter = (sub?: FunStateSub<T>): T => {
      if (sub) {
         subs.push(sub);
      }
      return value;
   };
   getter[FN_TYPE] = FN_TYPE_STATE_GETTER;

   const setter = (nextValue: T): void => {
      if (!Object.is(nextValue, value)) {
         value = nextValue;
         subs.forEach((sub) => sub(value));
      }
   };

   const release = (): void => {
      subs.length = 0;
   };

   return [getter, setter, release];
};
