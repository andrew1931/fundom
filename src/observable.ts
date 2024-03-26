export interface IObservableState<T> {
   value: T;
   next(nextValue: T): void;
   subscribe(fn: (value: T) => void): () => void;
   subscribeImmediate(fn: (value: T) => void): () => void;
}

export class ObservableState<T> implements IObservableState<T> {
   value: T;
   private subscribers: ((value: T) => void)[] = [];

   constructor(initialValue: T) {
      this.value = initialValue;
   }

   next(nextValue: T): void {
      this.value = nextValue;
      this.subscribers.forEach((fn) => fn(this.value));
   }

   subscribe(fn: (value: T) => void): () => void {
      this.subscribers.push(fn);
      return () => {
         this.subscribers = this.subscribers.filter((item) => item !== fn);
      };
   }

   subscribeImmediate(fn: (value: T) => void): () => void {
      fn(this.value);
      return this.subscribe(fn);
   }
}
