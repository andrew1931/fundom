import { describe, expect, test, vi } from 'vitest';
import { fmt, cmp } from '../../src/utils';
import { funState } from '../../src/state';

describe('testing utils', () => {
   test(`fmt should return string formatter which should:
            - parse first argument by {} and replace it with consecutive arguments;
            - concatenate all arguments if first argument is not a string or number of rest arguments !== number of {};
            - subscribe to state getters if passed`, () => {
      const handlerStub = vi.fn();
      const formatter = fmt('{}', 0);
      formatter(handlerStub);
      expect(handlerStub).toHaveBeenCalledTimes(1);
      expect(handlerStub).toHaveBeenCalledWith('0');
      vi.clearAllMocks();

      const [getPrimitiveState, setPrimitiveState] = funState(5);
      const formatter2 = fmt('value is: {}', getPrimitiveState);
      formatter2(handlerStub);
      expect(handlerStub).toHaveBeenCalledTimes(1);
      expect(handlerStub).toHaveBeenCalledWith('value is: 5');
      setPrimitiveState(6);
      expect(handlerStub).toHaveBeenCalledTimes(2);
      expect(handlerStub).toHaveBeenCalledWith('value is: 6');
      vi.clearAllMocks();

      const [getComplexState, setComplexState] = funState({ value: 5 });
      const formatter3 = fmt(
         'value is: {}, initial is: {}',
         cmp(getComplexState, (v) => v.value + 1),
         5,
      );
      formatter3(handlerStub);
      expect(handlerStub).toHaveBeenCalledTimes(1);
      expect(handlerStub).toHaveBeenCalledWith('value is: 6, initial is: 5');
      setComplexState({ value: 7 });
      expect(handlerStub).toHaveBeenCalledTimes(2);
      expect(handlerStub).toHaveBeenCalledWith('value is: 8, initial is: 5');
      vi.clearAllMocks();

      const [getInnerState, setInnerState] = funState(5);
      const formatter4 = fmt(
         '{}, outer value is: {}',
         fmt('I am fmt inside fmt with value: {}', getInnerState),
         5,
      );
      formatter4(handlerStub);
      expect(handlerStub).toHaveBeenCalledTimes(1);
      expect(handlerStub).toHaveBeenCalledWith(
         'I am fmt inside fmt with value: 5, outer value is: 5',
      );
      setInnerState(8);
      expect(handlerStub).toHaveBeenCalledTimes(2);
      expect(handlerStub).toHaveBeenCalledWith(
         'I am fmt inside fmt with value: 8, outer value is: 5',
      );
   });

   test(`cmp should accept state getter and computer callback and return function which should:
         - subscribe to state getter with passed handler callback;
         - call passed handler callback with first argument if it is not state getter`, () => {
      const handlerStub = vi.fn();
      const [getState, setState] = funState({ value: 5 });
      const compute = cmp(getState, (v) => v.value + 1);
      compute(handlerStub);
      expect(handlerStub).toHaveBeenCalledTimes(1);
      expect(handlerStub).toHaveBeenCalledWith(6);
      setState({ value: 7 });
      expect(handlerStub).toHaveBeenCalledTimes(2);
      expect(handlerStub).toHaveBeenCalledWith(8);
      vi.clearAllMocks();

      // @ts-ignore
      const compute2 = cmp(5, (v) => v + 1);
      compute2(handlerStub);
      expect(handlerStub).toHaveBeenCalledTimes(1);
      expect(handlerStub).toHaveBeenCalledWith(6);
   });
});
