import {
   _isStateGetter,
   FN_TYPE,
   FN_TYPE_FORMAT,
   FN_TYPE_COMPUTE,
   _isComputeUtil,
   _isFormatUtil,
} from './_utils';
import type {
   FormatReturnValue,
   ComputeReturnValue,
   IncomingFormatItem,
   FunStateGetter,
} from './types';

export const fmt$ = (...values: Array<IncomingFormatItem>): FormatReturnValue => {
   formatter[FN_TYPE] = FN_TYPE_FORMAT;
   function formatter(handler: (val: string | number, firstHandle: boolean) => void) {
      const SPLIT_CHAR = '{}';
      const result: (string | number)[] = [];

      if (values.length < 2) {
         console.warn('fmt$ util needs at least 2 arguments to make sense');
         pushToResult(values[0] ?? '');
         return handler(result.join(''), true);
      }

      if (typeof values[0] === 'string') {
         const splitByBraces = values[0].split(SPLIT_CHAR);
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
               `number of ${SPLIT_CHAR} in fmt$ util is not equal to number of dynamic arguments, falling back to concatenating all`,
            );
            populateResultWithAll();
         }
      } else {
         console.warn(
            `first argument of fmt$ is not a string type, falling back to concatenating all`,
         );
         populateResultWithAll();
      }

      function pushToResult(value: IncomingFormatItem) {
         let indexAfterPush = result.length;
         if (_isComputeUtil(value) || _isFormatUtil(value)) {
            value((val, firstHandle) => {
               if (firstHandle) {
                  result.push(val as string | number);
               } else {
                  result[indexAfterPush] = val as string | number;
                  handler(result.join(''), false);
               }
            });
         } else if (_isStateGetter(value)) {
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
   return formatter;
};

export const comp$ = <T, U>(
   stateGetter: FunStateGetter<T>,
   computer: (val: T) => U,
): ComputeReturnValue => {
   compute[FN_TYPE] = FN_TYPE_COMPUTE;
   function compute(handler: (val: U, firstHandle: boolean) => void) {
      if (_isStateGetter(stateGetter)) {
         const val = stateGetter((v: T) => {
            handler(computer(v), false);
         });
         handler(computer(val), true);
      } else {
         console.warn(
            `${stateGetter} is not of FunStateGetter type, passing it to computer function`,
         );
         handler(computer(stateGetter), true);
      }
   }
   return compute;
};
