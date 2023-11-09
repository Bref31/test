/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EligibilityMask } from './EligibilityMask';
import type { Horizon } from './Horizon';

export type EligibilityRequest = {
    satelliteIds: Array<number>;
    stationWithMasks: Array<EligibilityMask>;
    horizon: Horizon;
    step?: (string | null);
    cache?: boolean;
    backend?: EligibilityRequest.backend;
};

export namespace EligibilityRequest {

    export enum backend {
        ASTROPY = 'astropy',
        CELEST = 'celest',
    }


}
