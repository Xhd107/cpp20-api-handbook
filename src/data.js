import { categories as standardCategories, coreApis } from './data-core.js';
import { algorithmApis } from './data-algorithms.js';
import { tailApis } from './data-tail.js';
import { unrealCategories, unrealApis } from './data-unreal.js';

export const categories = [...standardCategories, ...unrealCategories];
export const apis = [...coreApis, ...algorithmApis, ...tailApis, ...unrealApis];
