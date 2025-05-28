import {
   _isStateGetter,
   FN_TYPE,
   FN_TYPE_COMPUTE,
   FN_TYPE_COMPUTE_STATE
} from './_utils';
import type {
   ComputedReturnValue,
   ComputedStateReturnValue,
   IncomingComputedItem,
   FunStateGetter
} from './types';


export const computed$ = (...values: Array<IncomingComputedItem>): ComputedReturnValue => {
   compute[FN_TYPE] = FN_TYPE_COMPUTE;
   function compute(
      handler: (val: string | number, firstHandle: boolean) => void
   ) {
      const COMPUTE_SPLIT_CHAR = '{}';
      const result: (string | number)[] = [];

      if (values.length < 2) {
         console.warn('computed$ util needs at least 2 arguments to make sense');
         pushToResult(values[0] ?? '');
         return handler(result.join(''), true);
      }

      if (typeof values[0] === 'string') {
         const splitByBraces = values[0].split(COMPUTE_SPLIT_CHAR);
         if (splitByBraces.length === values.length) {
            pushToResult(splitByBraces.shift() ?? '');
            for (let i = 1; i < values.length; i++) {
               const value = values[i];
               pushToResult(value ?? '');
               if (splitByBraces.length > 0) {
                  pushToResult(splitByBraces.shift() || '');
               }
            }
         } else {
            console.warn(
               `number of ${COMPUTE_SPLIT_CHAR} in computed$ util is not equal to number of dynamic arguments, falling back to concatenating all`
            );
            populateResultWithAll();
         }
      } else {
         console.warn(
            `first argument of computed$ is not a string type, falling back to concatenating all`
         );
         populateResultWithAll();
      }

      function pushToResult(value: IncomingComputedItem) {
         if (_isStateGetter(value)) {
            let indexAfterPush = result.length;
            const val = value((v: string | number) => {
               result[indexAfterPush] = v;
               handler(result.join(''), false);
            });
            result.push(val);
         } else {
            result.push(value);
         }
      }

      function populateResultWithAll() {
         for (let value of values) {
            pushToResult(value);
         }
      }
      
      return handler(result.join(''), true);
   }
   return compute;
};

export const computedState$ = <T>(
   stateGetter: FunStateGetter<T>, cb: (val: T) => boolean
): ComputedStateReturnValue => {
   computeState[FN_TYPE] = FN_TYPE_COMPUTE_STATE;
   function computeState(
      handler: (val: boolean, firstHandle: boolean) => void
   ) {
      if (_isStateGetter(stateGetter)) {
         const val = stateGetter((v: T) => {
            handler(cb(v), false)
         });
         return handler(cb(val), true);
      } else {
         console.warn(`${stateGetter} is not of FunStateGetter type, passing it to callback`);
         return handler(cb(stateGetter), true);
      }
   }
   return computeState;
};