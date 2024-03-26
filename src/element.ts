import { IObservableState, ObservableState } from './observable';

const elementUpdater = <T extends HTMLElement>(cb: (value: T) => void): ((el: T) => T) => {
   return (el) => {
      cb(el);
      return el;
   };
};

const elementUpdaterAsync = <T extends HTMLElement>(
   cb: (value: T) => Promise<T>,
): ((el: T) => Promise<T>) => {
   return async (el) => {
      await cb(el);
      return el;
   };
};

export const composeOrPipeAsync =
   (direction: 1 | -1) =>
   <T extends HTMLElement>(
      ...functions: ReturnType<typeof elementUpdater<T> | typeof elementUpdaterAsync<T>>[]
   ): ((el: () => T) => Promise<T>) => {
      return async (el) => {
         let _el = el();
         const targetArray = direction === 1 ? functions : functions.reverse();
         for await (const fn of targetArray) {
            const res = fn(_el);
            if (res instanceof Promise) {
               _el = await res;
            } else {
               _el = res;
            }
         }
         return _el;
      };
   };

const composeOrPipe =
   (direction: 1 | -1) =>
   <T extends HTMLElement>(
      ...functions: ReturnType<typeof elementUpdater<T>>[]
   ): ((el: () => T) => T) => {
      return (el) => {
         const _el = el();
         const targetMethod = direction === 1 ? 'reduce' : 'reduceRight';
         return functions[targetMethod]((prev, cur) => {
            return cur(prev);
         }, _el);
      };
   };

export const compose = composeOrPipe(-1);

export const pipe = composeOrPipe(1);

export const composeAsync = composeOrPipeAsync(-1);

export const pipeAsync = composeOrPipeAsync(1);

const textOrHtml =
   (targetMethod: 'innerHTML' | 'innerText') =>
   <T extends HTMLElement>(...content: (any | IObservableState<any>)[]) =>
      elementUpdater<T>((el) => {
         let result: any[] = [];
         const updateText = () => (el[targetMethod] = result.join(''));
         content.forEach((item, index) => {
            if (item instanceof ObservableState) {
               result.push(item.current);
               item.subscribe((val) => {
                  result[index] = val;
                  updateText();
               });
            } else {
               result.push(item);
            }
         });
         updateText();
      });

export const html = textOrHtml('innerHTML');

export const text = textOrHtml('innerText');

type AttrInput =
   | Record<string, string | IObservableState<string>>
   | IObservableState<Record<string, string>>;

export const attr = <T extends HTMLElement>(attributes: AttrInput) =>
   elementUpdater<T>((el) => {
      const updateAttribute = (key: string, val: string) => {
         el.setAttribute(key, val);
      };
      if (attributes instanceof ObservableState) {
         attributes.subscribe((attr: Record<string, string>) => {
            Object.entries(attr).forEach(([key, value]) => {
               updateAttribute(key, value);
            });
         });
      } else {
         Object.entries(attributes).forEach(([key, value]) => {
            if (value instanceof ObservableState) {
               value.subscribeImmediate((val) => {
                  updateAttribute(key, val);
               });
            } else {
               updateAttribute(key, value as string);
            }
         });
      }
   });

type StyleInput =
   | Record<string, (string | number) | IObservableState<string | number>>
   | IObservableState<Record<string, string | number>>;

export const style = <T extends HTMLElement>(styles: StyleInput) =>
   elementUpdater<T>((el) => {
      const updateStyle = (key: string, val: string | number) => {
         // @ts-ignore have a contract that key is valid style property
         el.style[key] = val;
      };
      if (styles instanceof ObservableState) {
         styles.subscribe((values: Record<string, string | number>) => {
            Object.entries(values).forEach(([key, value]) => {
               updateStyle(key, value);
            });
         });
      } else {
         Object.entries(styles).forEach(([key, value]) => {
            if (value instanceof ObservableState) {
               value.subscribeImmediate((val) => {
                  updateStyle(key, val);
               });
            } else {
               updateStyle(key, value as string | number);
            }
         });
      }
   });

export const displayWhen = <T extends HTMLElement>(value: IObservableState<any>) =>
   elementUpdater<T>((el) => {
      const initialDisplay = el.style.display;
      const updateDisplay = (val: any) => {
         el.style.display = val ? initialDisplay : 'none';
      };
      if (value instanceof ObservableState) {
         value.subscribeImmediate((val) => {
            updateDisplay(val);
         });
      } else {
         console.warn('[displayWhen]: provided value id not instanceof ObservableState');
      }
   });

export const renderWhen = <T extends HTMLElement>(value: IObservableState<any>) =>
   elementUpdater<T>((el) => {
      let parent: ParentNode | null = null;
      let clone: Node | null;
      const updateDisplay = (val: any) => {
         if (!parent) {
            parent = el.parentNode;
         }
         if (parent) {
            if (val) {
               parent.appendChild(clone || el);
            } else {
               clone = parent.removeChild(clone || el);
            }
         }
      };
      if (value instanceof ObservableState) {
         value.subscribeImmediate((val) => {
            updateDisplay(val);
         });
      } else {
         console.warn('[renderWhen]: provided value id not instanceof ObservableState');
      }
   });

export const switchCase = <T extends HTMLElement, C extends HTMLElement, V>(
   value: V | IObservableState<V>,
   cases: Array<[predicate: (value: V) => boolean, element: C]>,
) =>
   elementUpdater<T>((el) => {
      const handleCases = (val: V): void => {
         for (let caseItem of cases) {
            if (caseItem[0](val)) {
               el.appendChild(caseItem[1]);
               break;
            }
         }
      };
      if (value instanceof ObservableState) {
         value.subscribe((val) => {
            handleCases(val);
         });
      } else {
         handleCases(value as V);
      }
   });

export const children = <T extends HTMLElement>(...content: T[]) =>
   elementUpdater<T>((el) => {
      content.forEach((item) => el.appendChild(item));
   });

export const forEach = <T extends HTMLElement, C extends HTMLElement, D>(
   data: D[] | IObservableState<D[]>,
   childCb: (el: D, index: number) => C,
) =>
   elementUpdater<T>((el) => {
      if (data instanceof ObservableState) {
         data.subscribe((val) => {
            // TODO: implement forEach for ObservableState input
            console.log(val);
         });
      } else {
         if (Array.isArray(data)) {
            data.forEach((item, index) => {
               el.appendChild(childCb(item, index));
            });
         } else {
            console.error('[forEach]: provided argument is not an array: ', data);
         }
      }
   });

export const event = <T extends HTMLElement>(
   eventName: string,
   cb: (this: GlobalEventHandlers, ev: Event) => void,
) =>
   elementUpdater<T>((el) => {
      // @ts-ignore user's responsibility to use valid event name
      el[eventName] = cb;
   });

export const wait = <T extends HTMLElement>(time: number) =>
   elementUpdaterAsync<T>((el) => {
      return new Promise((resolve) => setTimeout(() => resolve(el), time));
   });

export const tap = <T extends HTMLElement>(cb: () => void) =>
   elementUpdater<T>(() => {
      cb();
   });