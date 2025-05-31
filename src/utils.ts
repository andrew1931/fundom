import { _isStateGetter, FN_TYPE, FN_TYPE_FORMAT, FN_TYPE_BOOL } from './_utils';
import type {
   FormatReturnValue,
   BoolReturnValue,
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
   return formatter;
};

export const bool$ = <T>(
   stateGetter: FunStateGetter<T>,
   predicate: (val: T) => boolean,
): BoolReturnValue => {
   bool[FN_TYPE] = FN_TYPE_BOOL;
   function bool(handler: (val: boolean, firstHandle: boolean) => void) {
      if (_isStateGetter(stateGetter)) {
         const val = stateGetter((v: T) => {
            handler(predicate(v), false);
         });
         return handler(predicate(val), true);
      } else {
         console.warn(`${stateGetter} is not of FunStateGetter type, passing it to callback`);
         return handler(predicate(stateGetter), true);
      }
   }
   return bool;
};
