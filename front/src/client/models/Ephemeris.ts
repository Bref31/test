/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EphemerisPosition } from './EphemerisPosition';
import type { EphemerisVelocity } from './EphemerisVelocity';

/**
 * Class representing the ephemeris of a single satellite.
 */
export type Ephemeris = {
    position: EphemerisPosition;
    velocity?: (EphemerisVelocity | null);
};
