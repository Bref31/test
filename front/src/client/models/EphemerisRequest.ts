/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FloatDataFormat } from './FloatDataFormat';
import type { Horizon } from './Horizon';

export type EphemerisRequest = {
    horizon: Horizon;
    velocity?: boolean;
    format?: FloatDataFormat;
    satelliteIds: Array<number>;
    cache?: boolean;
    backend?: any;
};
