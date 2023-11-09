/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EphemerisRequest } from '../models/EphemerisRequest';
import type { EphemerisResponse } from '../models/EphemerisResponse';
import type { Horizon } from '../models/Horizon';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class EphemerisService {

    /**
     * Get Horizons By Satellite Id
     * @param satelliteId 
     * @returns Horizon Successful Response
     * @throws ApiError
     */
    public static getComputedEphemerisHorizonsBySatelliteId(
satelliteId: number,
): CancelablePromise<Array<Horizon>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/ephemeris/list/satellite/{satellite_id}',
            path: {
                'satellite_id': satelliteId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Horizons By Constellation Id
     * @param constellationId 
     * @returns Horizon Successful Response
     * @throws ApiError
     */
    public static getComputedEphemerisHorizonsByConstellationId(
constellationId: number,
): CancelablePromise<Array<Horizon>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/ephemeris/list/constellation/{constellation_id}',
            path: {
                'constellation_id': constellationId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Horizons By System Id
     * @param systemId 
     * @returns Horizon Successful Response
     * @throws ApiError
     */
    public static getComputedEphemerisHorizonsBySystemId(
systemId: number,
): CancelablePromise<Array<Horizon>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/ephemeris/list/system/{system_id}',
            path: {
                'system_id': systemId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Compute Ephemeris
     * @param requestBody 
     * @returns EphemerisResponse Successful Response
     * @throws ApiError
     */
    public static computeEphemeris(
requestBody: EphemerisRequest,
): CancelablePromise<EphemerisResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/ephemeris/compute',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Unprocessable Entity`,
            },
        });
    }

}
