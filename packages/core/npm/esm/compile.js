import {
    compileMessage as compileMessageProd
} from './compile.production.min.js';

import {
    compileMessage as compileMessageDev
} from './compile.development.js';

export const compileMessage = process.env.NODE_ENV === 'production' ? compileMessageProd : compileMessageDev;
