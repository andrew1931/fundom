import { IObservableState, ObservableState } from './observable';

export const div = (): HTMLDivElement => {
   return document.createElement('div');
};

const elementUpdater = <T extends HTMLElement>(cb: (value: T) => void): ((el: T) => T) => {
   return (el) => {
      cb(el);
      return el;
   };
};

export const compose = <T extends HTMLElement>(
   ...functions: ReturnType<typeof elementUpdater<T>>[]
): ((el: () => T) => T) => {
   return (_element) => {
      const el = _element();
      return functions.reduceRight((prev, cur) => cur(prev), el);
   };
};

const textOrHtml =
   (targetMethod: 'innerHTML' | 'innerText') =>
   <T extends HTMLElement>(...content: (any | IObservableState<any>)[]) =>
      elementUpdater<T>((el) => {
         let result: any[] = [];
         const updateText = () => (el[targetMethod] = result.join(''));
         content.forEach((item, index) => {
            if (item instanceof ObservableState) {
               result.push(item.value);
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

export const attr = <T extends HTMLElement>(attributes: Record<string, string | IObservableState<string>>) =>
   elementUpdater<T>((el) => {
      const updateAttribute = (key: string, val: string) => {
         el.setAttribute(key, val);
      };
      Object.entries(attributes).forEach(([key, value]) => {
         if (value instanceof ObservableState) {
            value.subscribeImmediate((val) => {
               updateAttribute(key, val);
            });
         } else {
            updateAttribute(key, value as string);
         }
      });
   });

export const style = <T extends HTMLElement>(
   styles: Record<string, (string | number) | IObservableState<string | number>>,
) =>
   elementUpdater<T>((el) => {
      const updateStyle = (key: string, val: string | number) => {
         // @ts-ignore have a contract that key is valid style property
         el.style[key] = val;
      };
      Object.entries(styles).forEach(([key, value]) => {
         if (value instanceof ObservableState) {
            value.subscribeImmediate((val) => {
               updateStyle(key, val);
            });
         } else {
            updateStyle(key, value as string | number);
         }
      });
   });

export const isDisplayed = <T extends HTMLElement>(value: IObservableState<any>) =>
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
         console.warn('isDisplayed: provided value id not instanceof ObservableState');
      }
   });

export const isRendered = <T extends HTMLElement>(value: IObservableState<any>) =>
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
         console.warn('isRendered: provided value id not instanceof ObservableState');
      }
   });

export const children = <T extends HTMLElement>(...content: T[]) =>
   elementUpdater<T>((el) => {
      content.forEach((item) => el.appendChild(item));
   });

export const list = <T extends HTMLElement, C extends HTMLElement, D>(
   data: D[] | IObservableState<D[]>,
   childCb: (el: D, index: number) => C,
) =>
   elementUpdater<T>((el) => {
      if (data instanceof ObservableState) {
         data.subscribe((val) => {
            console.log(val);
         });
      } else {
         if (Array.isArray(data)) {
            data.forEach((item, index) => {
               el.appendChild(childCb(item, index));
            });
         } else {
            console.error('list: provided argument is not an array: ', data);
         }
      }
   });

export const event = <T extends HTMLElement>(eventName: string, cb: (this: GlobalEventHandlers, ev: Event) => void) =>
   elementUpdater<T>((el) => {
      // @ts-ignore user's responsibility to use valid event name
      el[eventName] = cb;
   });
