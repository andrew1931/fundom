import { describe, expect, test, vi } from 'vitest';
import {
   _applyMutations,
   _camelToKebab,
   _makeSnapshot,
   _randomId,
   _appendComment,
   _isStateGetter,
   _isComputeUtil,
   _isFormatUtil,
   _handleUtilityIncomingValue,
   _hasChild,
   _removeChildren,
   _isFunction,
} from './_utils';
import { funState } from './state';
import { fmt$, comp$ } from './utils';

describe('testing internal utils', () => {
   test('_applyMutations should call all provided synchronous functions with provided arguments', () => {
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      const fn3 = vi.fn();
      const element = document.createElement('div');
      const snapshot = null;
      const comment = null;
      const context: string[] = [];
      expect(fn1).toHaveBeenCalledTimes(0);
      expect(fn2).toHaveBeenCalledTimes(0);
      expect(fn3).toHaveBeenCalledTimes(0);
      _applyMutations(element, [fn1, fn2, fn3], snapshot, comment, context);
      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn1).toHaveBeenCalledWith(element, snapshot, comment, context);
      expect(fn2).toHaveBeenCalledTimes(1);
      expect(fn2).toHaveBeenCalledWith(element, snapshot, comment, context);
      expect(fn3).toHaveBeenCalledTimes(1);
      expect(fn3).toHaveBeenCalledWith(element, snapshot, comment, context);

      fn1.mockClear();
      fn2.mockClear();
      fn3.mockClear();

      const snapshot2 = _makeSnapshot(element);
      const comment2 = document.createComment('');
      const context2 = ['string'];
      _applyMutations(element, [fn1, fn2, fn3], snapshot2, comment2, context2);
      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn1).toHaveBeenCalledWith(element, snapshot2, comment2, context2);
      expect(fn2).toHaveBeenCalledTimes(1);
      expect(fn2).toHaveBeenCalledWith(element, snapshot2, comment2, context2);
      expect(fn3).toHaveBeenCalledTimes(1);
      expect(fn3).toHaveBeenCalledWith(element, snapshot2, comment2, context2);
   });

   test('_camelToKebab should convert camel case string to kebab case string', () => {
      expect(_camelToKebab('backgroundColor')).toBe('background-color');
      expect(_camelToKebab('BackGroundNiceColor')).toBe('back-ground-nice-color');
      expect(_camelToKebab('')).toBe('');
      expect(_camelToKebab('background-color')).toBe('background-color');
   });

   test('_camelToKebab should return empty string if not string argument passed', () => {
      // @ts-ignore
      expect(_camelToKebab(null)).toBe('');
      // @ts-ignore
      expect(_camelToKebab({})).toBe('');
      // @ts-ignore
      expect(_camelToKebab(0)).toBe('');
   });

   test('_randomId should return random string with provided prefix', () => {
      const results = new Set<string>();
      const numberOfTests = 100000;
      for (let i = 0; i < numberOfTests; i++) {
         results.add(_randomId('index_' + i));
      }
      expect(results.size).toBe(numberOfTests);
      let index = 0;
      results.forEach((value) => {
         expect(value.startsWith('index_' + index)).toBe(true);
         index++;
      });
   });

   test(`_appendComment should insert comment before provided parent comment,
      append it if parent comment was not provided, ignore if comment already exists`, () => {
      const element = document.createElement('div');
      const insertSpy = vi.spyOn(element, 'insertBefore');
      const appendSpy = vi.spyOn(element, 'appendChild');
      const comment = document.createComment('');
      const comment2 = document.createComment('');
      const parentComment = document.createComment('');
      expect(element.contains(comment)).toBe(false);
      expect(element.contains(comment2)).toBe(false);
      _appendComment(element, comment, parentComment);
      _appendComment(element, comment, parentComment);
      _appendComment(element, comment2, null);
      _appendComment(element, comment2, null);
      expect(insertSpy).toBeCalledTimes(1); // 2-d call should be ignore
      expect(appendSpy).toBeCalledTimes(1); // 4-th call should be ignore
      expect(element.contains(comment)).toBe(true);
      expect(element.contains(comment2)).toBe(true);
   });

   test('_isStateGetter should detect if FunStateGetter function is passed or not', () => {
      const [testGetter] = funState('');
      expect(
         _isStateGetter((val: unknown) => {
            return val;
         }),
      ).toBe(false);
      expect(_isStateGetter(function () {})).toBe(false);
      expect(_isStateGetter(testGetter())).toBe(false);
      expect(_isStateGetter(testGetter)).toBe(true);
   });

   test('_isFormatUtil should detect if FormatReturnValue function is passed or not', () => {
      expect(_isFormatUtil(function () {})).toBe(false);
      expect(_isFormatUtil(fmt$)).toBe(false);
      expect(_isFormatUtil(fmt$('{}', 0))).toBe(true);
   });

   test('_isComputeUtil should detect if BoolReturnValue function is passed or not', () => {
      const [testGetter] = funState(0);
      expect(_isComputeUtil(function () {})).toBe(false);
      expect(_isComputeUtil(comp$)).toBe(false);
      expect(_isComputeUtil(comp$(testGetter, (v) => v === 0))).toBe(true);
   });

   test(`_handleUtilityIncomingValue should:
         - call fmt$ util if one is passed with passed handler as argument;
         - call comp$ util if one is passed with passed handler as argument;
         - call passed handler and subscribe to funState with same handler if FunStateGetter is passed;
         - call passed handler if value is neither FunStateGetter nor comp$ nor fmt$`, () => {
      // TODO: impl
   });

   test('_hasChild should detect if passed element contains passed child or not', () => {
      const parent = document.createElement('div');
      const child = document.createElement('div');
      expect(_hasChild(parent, child)).toBe(false);
      parent.appendChild(child);
      expect(_hasChild(parent, child)).toBe(true);
      parent.removeChild(child);
      expect(_hasChild(parent, child)).toBe(false);
   });

   test('_removeChildren should remove passed children from passed element if they exist', () => {
      const parent = document.createElement('div');
      const child1 = document.createElement('div');
      const child2 = document.createElement('div');
      parent.append(child1, child2);
      expect(parent.contains(child1)).toBe(true);
      expect(parent.contains(child2)).toBe(true);
      _removeChildren(parent, child1, child2);
      expect(parent.contains(child1)).toBe(false);
      expect(parent.contains(child2)).toBe(false);
   });

   test('_isFunction should detect if passed argument is a function', () => {
      expect(_isFunction(() => {})).toBe(true);
      expect(_isFunction(function () {})).toBe(true);
      expect(_isFunction('')).toBe(false);
      expect(_isFunction(null)).toBe(false);
      expect(_isFunction({})).toBe(false);
      expect(_isFunction(1)).toBe(false);
      expect(_isFunction(undefined)).toBe(false);
   });
});
