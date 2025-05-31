import { describe, expect, test, vi } from 'vitest';
import { funState } from './state';

describe('testing funState', () => {
   test('funState should return array of 3 functions: getter, setter, releaser', () => {
      const state = funState('');
      expect(Array.isArray(state)).toBe(true);
      expect(state.length).toBe(3);
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

   test('funState releaser should unsubscribe provided callback or unsubscribe all otherwise', () => {
      const [getState, setState, releaseState] = funState({});
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
