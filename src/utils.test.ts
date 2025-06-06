import { describe, expect, test, vi } from 'vitest';
import { fmt$, comp$ } from './utils';
import { funState } from './state';

describe('testing utils', () => {
   test(`fmt$ should return string formatter which should:
            - parse first argument by {} and replace it with consecutive arguments;
            - concatenate all arguments if first argument is not a string or number of rest arguments !== number of {};
            - subscribe to state getters if passed`, () => {
      const handlerStub = vi.fn();
      const formatter = fmt$('{}', 0);
      formatter(handlerStub);
      expect(handlerStub).toHaveBeenCalledTimes(1);
      expect(handlerStub).toHaveBeenCalledWith('0', true);
      vi.clearAllMocks();

      const [getPrimitiveState, setPrimitiveState] = funState(5);
      const formatter2 = fmt$('value is: {}', getPrimitiveState);
      formatter2(handlerStub);
      expect(handlerStub).toHaveBeenCalledTimes(1);
      expect(handlerStub).toHaveBeenCalledWith('value is: 5', true);
      setPrimitiveState(6);
      expect(handlerStub).toHaveBeenCalledTimes(2);
      expect(handlerStub).toHaveBeenCalledWith('value is: 6', false);
      vi.clearAllMocks();

      const [getComplexState, setComplexState] = funState({ value: 5 });
      const formatter3 = fmt$(
         'value is: {}, initial is: {}',
         comp$(getComplexState, (v) => v.value + 1),
         5,
      );
      formatter3(handlerStub);
      expect(handlerStub).toHaveBeenCalledTimes(1);
      expect(handlerStub).toHaveBeenCalledWith('value is: 6, initial is: 5', true);
      setComplexState({ value: 7 });
      expect(handlerStub).toHaveBeenCalledTimes(2);
      expect(handlerStub).toHaveBeenCalledWith('value is: 8, initial is: 5', false);
      vi.clearAllMocks();

      const [getInnerState, setInnerState] = funState(5);
      const formatter4 = fmt$(
         '{}, outer value is: {}',
         fmt$('I am fmt$ inside fmt$ with value: {}', getInnerState),
         5,
      );
      formatter4(handlerStub);
      expect(handlerStub).toHaveBeenCalledTimes(1);
      expect(handlerStub).toHaveBeenCalledWith(
         'I am fmt$ inside fmt$ with value: 5, outer value is: 5',
         true,
      );
      setInnerState(8);
      expect(handlerStub).toHaveBeenCalledTimes(2);
      expect(handlerStub).toHaveBeenCalledWith(
         'I am fmt$ inside fmt$ with value: 8, outer value is: 5',
         false,
      );
   });

   test(`comp$ should accept state getter and computer callback and return function which should:
         - subscribe to state getter with passed handler callback;
         - call passed handler callback with first argument if it is not state getter`, () => {
      const handlerStub = vi.fn();
      const [getState, setState] = funState({ value: 5 });
      const compute = comp$(getState, (v) => v.value + 1);
      compute(handlerStub);
      expect(handlerStub).toHaveBeenCalledTimes(1);
      expect(handlerStub).toHaveBeenCalledWith(6, true);
      setState({ value: 7 });
      expect(handlerStub).toHaveBeenCalledTimes(2);
      expect(handlerStub).toHaveBeenCalledWith(8, false);
      vi.clearAllMocks();

      // @ts-ignore
      const compute2 = comp$(5, (v) => v + 1);
      compute2(handlerStub);
      expect(handlerStub).toHaveBeenCalledTimes(1);
      expect(handlerStub).toHaveBeenCalledWith(6, true);
   });
});
