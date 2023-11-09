/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Class representing the template orbit for a constellation of satellites based on
 * Telesat system.
 */
export type TelesatOrbitParameters = {
    semiMajorAxisKm: number;
    inclinationDeg: number;
    eccentricity: number;
    argumentOfPerigeeDeg: number;
    epoch: string;
    raanBaseDeg: number;
    raanSpacingDeg?: (number | null);
    mode: any;
    trueAnomalyPeriodDeg: number;
};
