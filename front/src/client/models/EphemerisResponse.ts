/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Ephemeris } from './Ephemeris';
import type { FloatDataFormat } from './FloatDataFormat';
import type { Horizon } from './Horizon';

export type EphemerisResponse = {
    horizon: Horizon;
    velocity?: boolean;
    format?: FloatDataFormat;
    ephemeris: Record<string, Ephemeris>;
};
