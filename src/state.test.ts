import { describe, expect, test, vi } from 'vitest';
import { funState } from './state';

describe('testing funState', () => {
   test('funState should return array of 4 functions: getter, setter, pauserResumer, releaser', () => {
      const state = funState('');
      expect(Array.isArray(state)).toBe(true);
      expect(state.length).toBe(4);
      state.forEach((item) => expect(typeof item === 'function').toBe(true));
   });

   test(`funState getter should:
         - return current value;
         - accept 2 optional callbacks: subscriber and release effect`, () => {
      const [getState, setState] = funState(1);
      const subStub = vi.fn();
      const releaseStub = vi.fn();
      expect(getState()).toBe(1);
      setState(2);
      expect(getState()).toBe(2);
      getState(subStub, releaseStub);
      setState(3);
      expect(getState()).toBe(3);
      expect(subStub).toHaveBeenCalledTimes(1);
      expect(releaseStub).toHaveBeenCalledTimes(0);
      setState(4);
      expect(getState()).toBe(4);
      expect(subStub).toHaveBeenCalledTimes(2);
      expect(releaseStub).toHaveBeenCalledTimes(0);
   });

   test('funState setter should change state and notify subscribers if new value is different', () => {
      const [getState, setState] = funState(1);
      const subStub = vi.fn();
      getState(subStub);
      expect(subStub).toHaveBeenCalledTimes(0);
      setState(2);
      expect(subStub).toHaveBeenCalledTimes(1);
      setState(2);
      expect(subStub).toHaveBeenCalledTimes(1);
      setState(3);
      expect(subStub).toHaveBeenCalledTimes(2);
      expect(getState()).toBe(3);
   });

   test('funState pauserResumer should toggle subscribe state', () => {
      const [getState, setState, pauserResumer] = funState({});
      const subStub1 = vi.fn();
      const subStub2 = vi.fn();
      getState(subStub1);
      getState(subStub2);
      setState({});
      expect(subStub1).toHaveBeenCalledTimes(1);
      expect(subStub2).toHaveBeenCalledTimes(1);
      pauserResumer(subStub1);
      setState({});
      expect(subStub1).toHaveBeenCalledTimes(1);
      expect(subStub2).toHaveBeenCalledTimes(2);
      pauserResumer(subStub1);
      setState({});
      expect(subStub1).toHaveBeenCalledTimes(2);
      expect(subStub2).toHaveBeenCalledTimes(3);
      // pause all
      pauserResumer();
      setState({});
      expect(subStub1).toHaveBeenCalledTimes(2);
      expect(subStub2).toHaveBeenCalledTimes(3);
      pauserResumer();
      setState({});
      expect(subStub1).toHaveBeenCalledTimes(3);
      expect(subStub2).toHaveBeenCalledTimes(4);
      // pause all individually
      pauserResumer(subStub1);
      pauserResumer(subStub2);
      setState({});
      expect(subStub1).toHaveBeenCalledTimes(3);
      expect(subStub2).toHaveBeenCalledTimes(4);
      // resume all
      pauserResumer();
      setState({});
      expect(subStub1).toHaveBeenCalledTimes(4);
      expect(subStub2).toHaveBeenCalledTimes(5);
   });

   test('funState releaser should unsubscribe provided callback or unsubscribe all otherwise', () => {
      const [getState, setState, pauserResumer, releaseState] = funState({});
      const subStub1 = vi.fn();
      const subStub2 = vi.fn();
      const sub1ReleaseEffect = vi.fn();
      getState(subStub1, sub1ReleaseEffect);
      getState(subStub2);
      setState({});
      expect(sub1ReleaseEffect).toHaveBeenCalledTimes(0);
      expect(subStub1).toHaveBeenCalledTimes(1);
      expect(subStub2).toHaveBeenCalledTimes(1);
      releaseState(subStub1);
      setState({});
      expect(sub1ReleaseEffect).toHaveBeenCalledTimes(1);
      expect(subStub1).toHaveBeenCalledTimes(1);
      expect(subStub2).toHaveBeenCalledTimes(2);
      releaseState();
      setState({});
      expect(sub1ReleaseEffect).toHaveBeenCalledTimes(1);
      expect(subStub1).toHaveBeenCalledTimes(1);
      expect(subStub2).toHaveBeenCalledTimes(2);
   });
});
