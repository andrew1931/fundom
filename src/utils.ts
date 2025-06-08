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
   TextValue,
} from './types';

export const fmt$ = <T>(...values: Array<IncomingFormatItem<T>>): FormatReturnValue => {
   formatter[FN_TYPE] = FN_TYPE_FORMAT;
   function formatter(handler: (val: TextValue) => void) {
      const SPLIT_CHAR = '{}';
      const result: TextValue[] = [];

      if (values.length < 2) {
         console.warn('fmt$ util needs at least 2 arguments to make sense');
         pushToResult(values[0] ?? '');
         return handler(result.join(''));
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

      function pushToResult(value: IncomingFormatItem<T>) {
         let indexAfterPush = result.length;
         if (_isComputeUtil(value) || _isFormatUtil(value)) {
            value((val) => {
               if (result.length > indexAfterPush) {
                  result[indexAfterPush] = val as TextValue;
                  handler(result.join(''));
               } else {
                  result.push(val as TextValue);
               }
            });
         } else if (_isStateGetter<TextValue>(value)) {
            const val = value((v: TextValue) => {
               result[indexAfterPush] = v;
               handler(result.join(''));
            });
            result.push(val as TextValue);
         } else {
            result.push(value);
         }
      }

      function populateResultWithAll() {
         for (let value of values) {
            pushToResult(value);
         }
      }

      handler(result.join(''));
   }
   return formatter;
};

export const comp$ = <T, U>(
   stateGetter: FunStateGetter<T>,
   computer: (val: T) => U,
): ComputeReturnValue<U> => {
   compute[FN_TYPE] = FN_TYPE_COMPUTE;
   function compute(handler: (val: U) => void) {
      if (_isStateGetter(stateGetter)) {
         const val = stateGetter((v: T) => {
            handler(computer(v));
         });
         handler(computer(val));
      } else {
         console.warn(
            `${stateGetter} is not of FunStateGetter type, passing it to computer function`,
         );
         handler(computer(stateGetter));
      }
   }
   return compute;
};
