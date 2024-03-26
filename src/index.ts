import { composeOrPipe, composeOrPipeAsync } from './utils/_composeOrPipe';
import { textOrHtml } from './utils/_textOrHtml';

export * from './utils/attr';

export * from './utils/children';

export * from './utils/displayWhen';

export * from './utils/event';

export * from './utils/map';

export * from './utils/renderWhen';

export * from './utils/sleep';

export * from './utils/style';

export * from './utils/switchCase';

export * from './utils/tap';

export * from './observable';

export const compose = composeOrPipe(-1);

export const pipe = composeOrPipe(1);

export const composeAsync = composeOrPipeAsync(-1);

export const pipeAsync = composeOrPipeAsync(1);

export const html = textOrHtml('innerHTML');

export const text = textOrHtml('innerText');
