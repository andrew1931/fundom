import { elementUpdater } from './_elementUpdater';

export const event = (eventName: string, cb: (this: GlobalEventHandlers, ev: Event) => void) =>
   elementUpdater((el) => {
      // @ts-ignore user's responsibility to use valid event name
      el[eventName] = cb;
   });
