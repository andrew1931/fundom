import { FD } from '../utils/_elementUpdater';
import { ObservablesRegistry } from './observableRegistry';

export interface IObservableState<T> {
   current: T;
   next(nextValue: T): void;
   subscribe(fn: (value: T) => void, el?: FD.Element): () => void;
   subscribeImmediate(fn: (value: T) => void, el?: FD.Element): () => void;
   unsubscribeAll(): void;
}

export const isObservable = (value: unknown) => value instanceof ObservableState;

export class ObservableState<T> implements IObservableState<T> {
   current: T;
   private name = Symbol('ObservableState');

   constructor(initialValue: T) {
      this.current = initialValue;
      ObservablesRegistry.register(this.name);
   }

   private generateId(): number {
      return Date.now() + Math.floor(Math.random() * 100);
   }

   next(nextValue: T): void {
      this.current = nextValue;
      ObservablesRegistry.valueFor(this.name)?.forEach((el) =>
         el.forEach((fn) => fn(this.current)),
      );
   }

   subscribe(fn: (value: T) => void, el?: FD.Element): () => void {
      const id = el || this.generateId();
      ObservablesRegistry.for(this.name, id, fn);
      return () => {
         ObservablesRegistry.clearSubscribers(this.name, id);
      };
   }

   subscribeImmediate(fn: (value: T) => void, el?: FD.Element): () => void {
      fn(this.current);
      return this.subscribe(fn, el);
   }

   unsubscribeAll(): void {
      ObservablesRegistry.unregister(this.name);
   }
}
