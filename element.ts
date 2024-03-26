import { IObservableState, ObservableState } from './observable';

namespace DOM {
    export type Element<T> = {
        html: (content: string | IObservableState<any>) => T;
        text: (content: string | IObservableState<any>) => T;
        append: <C extends HTMLElement>(...content: C[]) => T;
        replaceWith: <C extends HTMLElement>(...content: C[]) => T;
    };
}

type ElementProps = {
    id?: string;
    classList?: string;
    attributes?: Record<string, string>;
    style?: Record<string, string | number>;
    onClick?: (this: GlobalEventHandlers, ev: MouseEvent) => void;
};

type ButtonElementProps = ElementProps & {
    disabled?: boolean;
};

const toDomElement = <T extends HTMLElement>(element: T): DOM.Element<T> => {
    return {
        html: (content: string | IObservableState<any>): T => {
            if (typeof content === 'string') {
                element.innerHTML = content;
            } else {
                content.subscribe((val) => {
                    element.innerHTML = val;
                });
            }
            return element;
        },
        text: (content: string | IObservableState<any>): T => {
            if (typeof content === 'string') {
                element.innerText = content;
            } else {
                content.subscribe((val) => {
                    element.innerHTML = val;
                });
            }
            return element;
        },
        append: <C extends HTMLElement>(...content: C[]): T => {
            content.forEach((item) => element.appendChild(item));

            return element;
        },
        replaceWith: <C extends HTMLElement>(...content: C[]): T => {
            element.innerHTML = '';
            content.forEach((item) => element.appendChild(item));
            return element;
        },
    };
};

const htmlElement = <T extends HTMLElement>(
    name: string,
    props?: ElementProps,
): T => {
    const element = document.createElement(name);
    if (props) {
        if (props.id) {
            element.id = props.id;
        }
        if (props.classList) {
            element.setAttribute('class', props.classList);
        }
        if (props.style) {
            Object.entries(props.style).forEach((key, value) => {
                // @ts-ignore have a contract that key is valid style property
                element.style[key] = value;
            });
        }
        if (props.attributes) {
            Object.entries(props.attributes).forEach((key, value) => {
                // @ts-ignore have a contract that key is valid attribute property
                element.setAttribute(key, value);
            });
        }
        if (props.onClick) {
            element.onclick = props.onClick;
        }
    }

    return element as T;
};

export const DIV = (attributes?: ElementProps): DOM.Element<HTMLDivElement> => {
    const div = htmlElement<HTMLDivElement>('div', attributes);
    return toDomElement(div);
};
export const BUTTON = (
    attributes?: ButtonElementProps,
): DOM.Element<HTMLButtonElement> => {
    const button = htmlElement<HTMLButtonElement>('button', attributes);
    button.disabled = attributes?.disabled || false;
    return toDomElement(button);
};
export const P = (
    attributes?: ElementProps,
): DOM.Element<HTMLParagraphElement> =>
    toDomElement(htmlElement<HTMLParagraphElement>('p', attributes));

export const TABLE = (
    attributes?: ElementProps,
): DOM.Element<HTMLTableElement> =>
    toDomElement(htmlElement<HTMLTableElement>('table', attributes));

export const SPAN = (attributes?: ElementProps): DOM.Element<HTMLSpanElement> =>
    toDomElement(htmlElement<HTMLSpanElement>('span', attributes));

export const H3 = (attributes?: ElementProps): DOM.Element<HTMLHeadElement> =>
    toDomElement(htmlElement<HTMLHeadElement>('h3', attributes));

export const H2 = (attributes?: ElementProps): DOM.Element<HTMLHeadElement> =>
    toDomElement(htmlElement<HTMLHeadElement>('h2', attributes));

export const H1 = (attributes?: ElementProps): DOM.Element<HTMLHeadElement> =>
    toDomElement(htmlElement<HTMLHeadElement>('h1', attributes));

export const UL = (attributes?: ElementProps): DOM.Element<HTMLUListElement> =>
    toDomElement(htmlElement<HTMLUListElement>('ul', attributes));

export const LI = (attributes?: ElementProps): DOM.Element<HTMLLIElement> =>
    toDomElement(htmlElement<HTMLLIElement>('li', attributes));

export const LIST = <T>(
    data: IObservableState<Array<T>> | Array<T>,
    mapFn: (el: T, index: number) => HTMLLIElement,
    attributes?: ElementProps,
): HTMLUListElement => {
    const list = UL(attributes);
    if (data instanceof ObservableState) {
        data.subscribe(() => {
            const children = data.value.map((el: T, index: number) => {
                return mapFn(el, index);
            });
            list.replaceWith(...children);
        });
        return list.html('');
    } else {
        // @ts-ignore cheked in higher branch
        const children = data.map((el: T, index: number) => {
            return mapFn(el, index);
        });
        return list.append(...children);
    }
};
