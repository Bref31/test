/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Station } from './Station';
import type { StationCreate } from './StationCreate';

export type GroundSegmentCreate = {
    name: string;
    stations: Array<(Station | StationCreate)>;
};
