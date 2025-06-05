import { describe, expect, test, vi } from 'vitest';
import { funState } from './state';

describe('testing funState', () => {
   test('funState should return array of 2 functions: getter, setter', () => {
      const state = funState('');
      expect(Array.isArray(state)).toBe(true);
      expect(state.length).toBe(2);
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

   test('funState setter should change state and notify subscribers if new value is provided', () => {
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

   test('funState setter should return controller if callback provided which should be able to pause, resume, release state', () => {
      const [getState, setState] = funState({});
      const subStub1 = vi.fn();
      const subStub2 = vi.fn();
      getState(subStub1);
      getState(subStub2);
      setState({});
      expect(subStub1).toHaveBeenCalledTimes(1);
      expect(subStub2).toHaveBeenCalledTimes(1);
      setState((f) => f('pause', subStub1));
      setState({});
      expect(subStub1).toHaveBeenCalledTimes(1);
      expect(subStub2).toHaveBeenCalledTimes(2);
      setState((f) => f('resume', subStub1));
      setState({});
      expect(subStub1).toHaveBeenCalledTimes(2);
      expect(subStub2).toHaveBeenCalledTimes(3);
      setState((f) => f('pause'));
      setState({});
      expect(subStub1).toHaveBeenCalledTimes(2);
      expect(subStub2).toHaveBeenCalledTimes(3);
      setState((f) => f('resume'));
      setState({});
      expect(subStub1).toHaveBeenCalledTimes(3);
      expect(subStub2).toHaveBeenCalledTimes(4);
      setState((f) => f('pause', subStub1));
      setState((f) => f('pause', subStub2));
      setState({});
      expect(subStub1).toHaveBeenCalledTimes(3);
      expect(subStub2).toHaveBeenCalledTimes(4);
      setState((f) => f('resume'));
      setState({});
      expect(subStub1).toHaveBeenCalledTimes(4);
      expect(subStub2).toHaveBeenCalledTimes(5);

      const subStub3 = vi.fn();
      const subStub4 = vi.fn();
      const sub3ReleaseEffect = vi.fn();
      getState(subStub3, sub3ReleaseEffect);
      getState(subStub4);
      setState({});
      expect(sub3ReleaseEffect).toHaveBeenCalledTimes(0);
      expect(subStub3).toHaveBeenCalledTimes(1);
      expect(subStub4).toHaveBeenCalledTimes(1);
      setState((f) => f('release', subStub3));
      setState({});
      expect(sub3ReleaseEffect).toHaveBeenCalledTimes(1);
      expect(subStub3).toHaveBeenCalledTimes(1);
      expect(subStub4).toHaveBeenCalledTimes(2);
      setState((f) => f('release'));
      setState({});
      expect(sub3ReleaseEffect).toHaveBeenCalledTimes(1);
      expect(subStub3).toHaveBeenCalledTimes(1);
      expect(subStub4).toHaveBeenCalledTimes(2);
   });
});
