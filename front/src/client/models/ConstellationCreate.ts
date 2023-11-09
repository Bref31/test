/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TelesatOrbitParameters } from './TelesatOrbitParameters';
import type { TrueAnomalyShiftOrbitParameters } from './TrueAnomalyShiftOrbitParameters';
import type { WalkerOrbitParameters } from './WalkerOrbitParameters';

/**
 * Schema used for creating a constellation.
 */
export type ConstellationCreate = {
    name: string;
    nPlanes: number;
    nPerPlane: number;
    orbitParameters: (TelesatOrbitParameters | WalkerOrbitParameters | TrueAnomalyShiftOrbitParameters);
};
