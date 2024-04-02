import { type FD, _elementUpdater } from './_elementUpdater';

export const event = (
   eventName: string,
   cb: (this: GlobalEventHandlers, ev: Event) => void,
): FD.ElementUpdater =>
   _elementUpdater((el) => {
      // @ts-ignore user's responsibility to use valid event name
      el[eventName] = cb;
      return el;
   });
