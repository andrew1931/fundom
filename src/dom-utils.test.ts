import { describe, expect, test, vi } from 'vitest';
import { _createContextItem, _makeSnapshot } from './_utils';
import { elem$, nodes$, list$, ifElse$, html$, txt$, on$ } from './dom-utils';
import { funState } from './state';

describe('testing dom utils', () => {
   test(`elem$ should return function which creates HTML element by passed string type, applies passed mutations to it and returns it`, () => {
      const mutatorStub = vi.fn();
      const elem = elem$('span', mutatorStub)();
      expect(elem instanceof HTMLSpanElement).toBe(true);
      expect(elem.attributes.length).toBe(0);
      expect(elem.classList.length).toBe(0);
      expect(elem.children.length).toBe(0);
      expect(mutatorStub).toHaveBeenCalledTimes(1);
      expect(mutatorStub).toHaveBeenCalledWith(elem, {}, '', false);
   });

   test('nodes$ should validate arguments', () => {
      const parent = document.createElement('div');
      const warnSpy = vi.spyOn(console, 'warn');
      // @ts-ignore testing wrong child
      const nodes = nodes$(null);

      // @ts-ignore testing wrong parent
      nodes(null, null, null, []);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith('value passed to nodes$ is not HTMLElement type');
      vi.clearAllMocks();
      nodes(parent, {}, '', false);
      expect(warnSpy).toHaveBeenCalledTimes(1);
   });

   test('nodes$ should return function which appends provided elements if snapshot is not passed', () => {
      const parent = document.createElement('div');
      const comment = document.createComment('');
      parent.append(document.createElement('div'), comment, document.createElement('br'));
      const nodes = nodes$(elem$('span'), elem$('p'));

      expect(parent.children.length).toBe(2);
      nodes(parent, {}, '', false);
      expect(parent.children.length).toBe(4);
      expect(parent.children[2] instanceof HTMLSpanElement).toBe(true);
      expect(parent.children[3] instanceof HTMLParagraphElement).toBe(true);
   });

   test('nodes$ should return function which insert provided elements before comment if one is passed and snapshot is not passed', () => {
      const parent = document.createElement('div');
      const comment = document.createComment('');
      const context = _createContextItem(parent, comment);
      parent.append(document.createElement('div'), comment, document.createElement('br'));
      const spanCreator = vi.fn(elem$('span'));
      const pCreator = vi.fn(elem$('p'));
      const nodes = nodes$(spanCreator, pCreator);
      expect(parent.children.length).toBe(2);

      nodes(parent, { contextId: context }, 'contextId', false);
      expect(spanCreator).toHaveBeenCalledTimes(1);
      expect(pCreator).toHaveBeenCalledTimes(1);
      expect(parent.children.length).toBe(4);
      expect(parent.children[0] instanceof HTMLDivElement).toBe(true);
      expect(parent.children[1] instanceof HTMLSpanElement).toBe(true);
      expect(parent.children[2] instanceof HTMLParagraphElement).toBe(true);
      expect(parent.children[3] instanceof HTMLBRElement).toBe(true);

      nodes(parent, { contextId: context }, 'contextId', false);
      expect(spanCreator).toHaveBeenCalledTimes(1);
      expect(pCreator).toHaveBeenCalledTimes(1);
      expect(parent.children.length).toBe(4);
   });

   test('nodes$ should return function which removes passed elements if snapshot is passed', () => {
      const parent = document.createElement('div');
      const comment = document.createComment('');
      const context = _createContextItem(parent, comment);
      parent.append(document.createElement('div'), comment, document.createElement('br'));
      const spanCreator = vi.fn(elem$('span'));
      const pCreator = vi.fn(elem$('p'));
      const nodes = nodes$(spanCreator, pCreator);

      expect(parent.children.length).toBe(2);

      nodes(parent, { contextId: context }, 'contextId', false);
      expect(spanCreator).toHaveBeenCalledTimes(1);
      expect(pCreator).toHaveBeenCalledTimes(1);
      expect(parent.children.length).toBe(4);
      expect(parent.children[0] instanceof HTMLDivElement).toBe(true);
      expect(parent.children[1] instanceof HTMLSpanElement).toBe(true);
      expect(parent.children[2] instanceof HTMLParagraphElement).toBe(true);
      expect(parent.children[3] instanceof HTMLBRElement).toBe(true);

      nodes(parent, { contextId: context }, 'contextId', true);
      expect(spanCreator).toHaveBeenCalledTimes(1);
      expect(pCreator).toHaveBeenCalledTimes(1);
      expect(parent.children.length).toBe(2);
      expect(parent.children[0] instanceof HTMLDivElement).toBe(true);
      expect(parent.children[1] instanceof HTMLBRElement).toBe(true);
   });

   test('list$ should validate arguments', () => {
      const warnSpy = vi.spyOn(console, 'warn');
      // @ts-ignore testing wrong child
      const list = list$(null);
      // @ts-ignore testing wrong parent
      list(null, null, null, []);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith('value passed to list$ is not HTMLElement type');
      vi.clearAllMocks();
   });

   test('list$ should render elements by passed array and callback which creates element', () => {
      const parent = document.createElement('div');
      const comment = document.createComment('');
      parent.append(comment);
      const context = _createContextItem(parent, comment);
      const mutatorStab = vi.fn((v: any, i: number) => vi.fn());
      const data = [{ val: 1 }, { val: 2 }];
      const list = list$(data, (v, i) => elem$('span', mutatorStab(v, i)));

      list(parent, { contextId: context }, 'contextId', false);
      expect(parent.children.length).toBe(2);
      expect(mutatorStab).toHaveBeenCalledTimes(2);
      expect(mutatorStab).toHaveBeenNthCalledWith(1, data[0], 0);
      expect(mutatorStab).toHaveBeenNthCalledWith(2, data[1], 1);
      list(parent, { contextId: context }, 'contextId', false);
      expect(parent.children.length).toBe(2);
   });

   test('list$ should render elements by passed state getter and callback which creates element and update them when state changes', () => {
      const parent = document.createElement('div');
      const comment = document.createComment('');
      const context = _createContextItem(parent, comment);
      parent.append(document.createElement('div'), comment, document.createElement('br'));
      const mutatorStab = vi.fn((v: any, i: number) => vi.fn());
      const [getData, setData] = funState([{ val: 1 }, { val: 2 }]);
      const list = list$(getData, (v, i) => elem$('span', mutatorStab(v, i)));

      expect(parent.children.length).toBe(2);
      list(parent, { contextId: context }, 'contextId', false);
      expect(parent.children.length).toBe(4);
      expect(parent.children[0] instanceof HTMLDivElement).toBe(true);
      expect(parent.children[1] instanceof HTMLSpanElement).toBe(true);
      expect(parent.children[2] instanceof HTMLSpanElement).toBe(true);
      expect(parent.children[3] instanceof HTMLBRElement).toBe(true);
      expect(mutatorStab).toHaveBeenCalledTimes(2);
      expect(mutatorStab).toHaveBeenNthCalledWith(1, getData()[0], 0);
      expect(mutatorStab).toHaveBeenNthCalledWith(2, getData()[1], 1);
      vi.clearAllMocks();

      setData([...getData(), { val: 3 }]);
      expect(parent.children.length).toBe(5);
      expect(parent.children[0] instanceof HTMLDivElement).toBe(true);
      expect(parent.children[1] instanceof HTMLSpanElement).toBe(true);
      expect(parent.children[2] instanceof HTMLSpanElement).toBe(true);
      expect(parent.children[3] instanceof HTMLSpanElement).toBe(true);
      expect(parent.children[4] instanceof HTMLBRElement).toBe(true);
      expect(mutatorStab).toHaveBeenCalledTimes(1);
      expect(mutatorStab).toHaveBeenNthCalledWith(1, getData()[2], 2);
      vi.clearAllMocks();

      setData([{ val: 4 }]);
      expect(parent.children.length).toBe(3);
      expect(parent.children[0] instanceof HTMLDivElement).toBe(true);
      expect(parent.children[1] instanceof HTMLSpanElement).toBe(true);
      expect(parent.children[2] instanceof HTMLBRElement).toBe(true);
      expect(mutatorStab).toHaveBeenCalledTimes(1);
      expect(mutatorStab).toHaveBeenNthCalledWith(1, getData()[0], 0);
      vi.clearAllMocks();

      // @ts-ignore test invalid data
      setData({});
      expect(parent.children.length).toBe(3);
      expect(parent.children[0] instanceof HTMLDivElement).toBe(true);
      expect(parent.children[1] instanceof HTMLSpanElement).toBe(true);
      expect(parent.children[2] instanceof HTMLBRElement).toBe(true);
      expect(mutatorStab).toHaveBeenCalledTimes(0);
      vi.clearAllMocks();

      setData([]);
      expect(parent.children.length).toBe(2);
      expect(parent.children[0] instanceof HTMLDivElement).toBe(true);
      expect(parent.children[1] instanceof HTMLBRElement).toBe(true);
      expect(mutatorStab).toHaveBeenCalledTimes(0);
      vi.clearAllMocks();
   });

   test('ifElse$ should validate arguments', () => {
      const warnSpy = vi.spyOn(console, 'warn');
      const ifElse = ifElse$(true)()();
      // @ts-ignore testing wrong parent
      ifElse(null, null, null, []);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith('value passed to ifElse$ is not HTMLElement type');
      vi.clearAllMocks();
   });

   test('ifElse$ should call arguments from second returned function if condition is true and from third function otherwise', () => {
      const parent = document.createElement('div');
      const utilStub1 = vi.fn();
      const utilStub2 = vi.fn();
      const utilStub3 = vi.fn();
      const utilStub4 = vi.fn();

      const ifElse1 = ifElse$(true)(utilStub1, utilStub2)(utilStub3, utilStub4);
      ifElse1(parent, {}, '', false);
      expect(utilStub1).toHaveBeenCalledTimes(1);
      expect(utilStub2).toHaveBeenCalledTimes(1);
      expect(utilStub3).toHaveBeenCalledTimes(0);
      expect(utilStub4).toHaveBeenCalledTimes(0);
      vi.clearAllMocks();

      const ifElse2 = ifElse$(false)(utilStub1, utilStub2)(utilStub3, utilStub4);
      ifElse2(parent, {}, '', false);
      expect(utilStub1).toHaveBeenCalledTimes(0);
      expect(utilStub2).toHaveBeenCalledTimes(0);
      expect(utilStub3).toHaveBeenCalledTimes(1);
      expect(utilStub4).toHaveBeenCalledTimes(1);
      vi.clearAllMocks();

      const [getState, setState] = funState(true);
      const ifElse3 = ifElse$(getState)(utilStub1, utilStub2)(utilStub3, utilStub4);
      ifElse3(parent, {}, '', false);
      expect(utilStub1).toHaveBeenCalledTimes(1);
      expect(utilStub2).toHaveBeenCalledTimes(1);
      expect(utilStub3).toHaveBeenCalledTimes(0);
      expect(utilStub4).toHaveBeenCalledTimes(0);
      vi.clearAllMocks();
      setState(false);
      expect(utilStub1).toHaveBeenCalledTimes(1); // revert
      expect(utilStub2).toHaveBeenCalledTimes(1); // revert
      expect(utilStub3).toHaveBeenCalledTimes(1);
      expect(utilStub4).toHaveBeenCalledTimes(1);
   });

   test('html$ should validate arguments', () => {
      const warnSpy = vi.spyOn(console, 'warn');
      const html = html$('<div></div>');
      // @ts-ignore testing wrong parent
      html(null, null, null, []);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith('value passed to html$ is not HTMLElement type');
      vi.clearAllMocks();
   });

   test(`html$ return function which:
         - inserts passed html string into current element;
         - reverts innerHTML value to value of provided snapshot if it is passed;
         - should subscribe to state getter if one is passed;`, () => {
      const snapshotHTMLString = '<h1>Test html</h1>';
      const htmlString = '<div><h1>Test html</h1></div>';
      const parent = document.createElement('div');
      parent.innerHTML = snapshotHTMLString;
      const context = _createContextItem(parent, undefined);

      const html = html$(htmlString);
      html(parent, {}, '', false);
      expect(parent.innerHTML).toBe(htmlString);
      html(parent, { contextId: context }, 'contextId', true);
      expect(parent.innerHTML).toBe(snapshotHTMLString);

      const [getState, setState] = funState('<div>state</div>');
      const html2 = html$(getState);
      html2(parent, { contextId: context }, 'contextId', false);
      expect(parent.innerHTML).toBe('<div>state</div>');
      setState('<div>updated state</div>');
      html2(parent, { contextId: context }, 'contextId', false);
      expect(parent.innerHTML).toBe('<div>updated state</div>');
   });

   test('txt$ should validate arguments', () => {
      const warnSpy = vi.spyOn(console, 'warn');
      const txt = txt$('');
      // @ts-ignore testing wrong parent
      txt(null, null, null, []);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith('value passed to txt$ is not HTMLElement type');
      vi.clearAllMocks();
   });

   test(`txt$ return function which:
         - inserts passed text string into current element;
         - reverts innerText value to value of provided snapshot if it is passed;
         - should subscribe to state getter if one is passed;`, () => {
      const snapshotString = 'initial string';
      const string = 'test string';
      const parent = document.createElement('div');
      parent.innerText = snapshotString;
      const context = _createContextItem(parent, undefined);

      const txt = txt$(string);
      txt(parent, { contextId: context }, 'contextId', false);
      expect(parent.innerText).toBe(string);
      txt(parent, { contextId: context }, 'contextId', true);
      expect(parent.innerText).toBe(snapshotString);

      const [getState, setState] = funState('state');
      const txt2 = txt$(getState);
      txt2(parent, {}, '', false);
      expect(parent.innerText).toBe('state');
      setState('updated state');
      txt2(parent, {}, '', false);
      expect(parent.innerText).toBe('updated state');
   });

   test('on$ should register event listener on current element', () => {
      const callbackStub = vi.fn();
      const [getUnsubscribe, setUnsubscribe] = funState(false);
      const elem = elem$('button', on$('click', callbackStub, getUnsubscribe))();
      expect(callbackStub).toHaveBeenCalledTimes(0);
      elem.click();
      elem.click();
      expect(callbackStub).toHaveBeenCalledTimes(2);
      setUnsubscribe(true);
      elem.click();
      expect(callbackStub).toHaveBeenCalledTimes(2);
   });
});
