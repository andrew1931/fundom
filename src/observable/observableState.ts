export interface IObservableState<T> {
   current: T;
   next(nextValue: T): void;
   subscribe(fn: (value: T) => void): () => void;
   subscribeImmediate(fn: (value: T) => void): () => void;
   unsubscribeAll(): void;
}

export const isObservable = (value: unknown) => value instanceof ObservableState;

export class ObservableState<T> implements IObservableState<T> {
   current: T;

   private subscribers: Map<number, (value: T) => void> = new Map();

   constructor(initialValue: T) {
      this.current = initialValue;
   }

   private generateId(): number {
      return Date.now() + Math.floor(Math.random() * 100);
   }

   next(nextValue: T): void {
      if (nextValue === this.current) return;
      this.current = nextValue;
      this.subscribers.forEach((fn) => fn(this.current));
   }

   subscribe(fn: (value: T) => void): () => void {
      const id = this.generateId();
      this.subscribers.set(id, fn);
      return () => {
         this.subscribers.delete(id);
      };
   }

   subscribeImmediate(fn: (value: T) => void): () => void {
      fn(this.current);
      return this.subscribe(fn);
   }

   unsubscribeAll(): void {
      this.subscribers.clear();
   }
}
