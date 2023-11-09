/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Satellite } from './Satellite';
import type { TelesatOrbitParameters } from './TelesatOrbitParameters';
import type { TrueAnomalyShiftOrbitParameters } from './TrueAnomalyShiftOrbitParameters';
import type { WalkerOrbitParameters } from './WalkerOrbitParameters';

export type Constellation = {
    name: string;
    nPlanes: number;
    nPerPlane: number;
    id: number;
    orbit: ((TelesatOrbitParameters | WalkerOrbitParameters | TrueAnomalyShiftOrbitParameters) | null);
    satellites: Array<Array<Satellite>>;
};
