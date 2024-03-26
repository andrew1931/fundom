export interface IObservableState<T> {
    type: symbol;
    value: T;
    next(nextValue: T): void;
    subscribe(fn: (value: T) => void): () => void;
}

export class ObservableState<T> implements IObservableState<T> {
    type = Symbol.for('ObservableState');
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
        fn(this.value);
        this.subscribers.push(fn);
        return () => {
            this.subscribers = this.subscribers.filter((item) => item !== fn);
        };
    }
}
