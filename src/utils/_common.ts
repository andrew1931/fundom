import { type FD } from './_elementUpdater';

export const _replaceOrAppend = (
   newElement: FD.Element,
   parent: FD.Element,
   lastAddedElement: FD.Element | undefined,
): FD.Element => {
   if (lastAddedElement) {
      lastAddedElement.replaceWith(newElement);
   } else {
      parent.appendChild(newElement);
   }
   return newElement;
};

export const _createElement = (element: string | FD.Element): FD.Element => {
   return typeof element === 'string' ? document.createElement(element) : element;
};

export const _uniqueNumber = (): number => {
   return Date.now() + Math.floor(Math.random() * 100);
};
