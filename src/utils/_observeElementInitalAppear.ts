import { type FD } from './_elementUpdater';

export const _observeElementInitialAppear = (el: FD.Element, onAppend: () => void) => {
   const observer = new MutationObserver((mutations) => {
      let elIsAdded = false;
      for (let mutation of mutations) {
         for (let node of mutation.addedNodes) {
            if (node === el || node.contains(el)) {
               onAppend();
               observer.disconnect();
               elIsAdded = true;
               break;
            }
         }
         if (elIsAdded) break;
      }
   });

   observer.observe(document.body, { childList: true });
};
