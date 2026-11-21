import { categories, coreApis } from './data-core.js';
import { algorithmApis } from './data-algorithms.js';
import { tailApis } from './data-tail.js';

export { categories };
export const apis = [...coreApis, ...algorithmApis, ...tailApis];
