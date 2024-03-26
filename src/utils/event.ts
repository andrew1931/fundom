import { elementUpdater } from './_elementUpdater';

export const event = <T extends HTMLElement>(
   eventName: string,
   cb: (this: GlobalEventHandlers, ev: Event) => void,
) =>
   elementUpdater<T>((el) => {
      // @ts-ignore user's responsibility to use valid event name
      el[eventName] = cb;
   });
