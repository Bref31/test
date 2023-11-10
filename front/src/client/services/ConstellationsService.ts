/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Constellation } from '../models/Constellation';
import type { ConstellationCreate } from '../models/ConstellationCreate';
import type { ConstellationInfo } from '../models/ConstellationInfo';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ConstellationsService {

    /**
     * List Constellations
     * @returns ConstellationInfo Successful Response
     * @throws ApiError
     */
    public static listConstellations(): CancelablePromise<Array<ConstellationInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/constellations/',
            errors: {
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * Get Constellation By Id
     * @param constellationId 
     * @returns Constellation Successful Response
     * @throws ApiError
     */
    public static getConstellation(
        constellationId: number,
    ): CancelablePromise<Constellation> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/constellations/{constellation_id}',
            path: {
                'constellation_id': constellationId,
            },
            errors: {
                404: `Not Found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Create Constellation
     * @param requestBody 
     * @returns Constellation Successful Response
     * @throws ApiError
     */
    public static createConstellation(
        requestBody: ConstellationCreate,
    ): CancelablePromise<Constellation> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/constellations/create',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Unprocessable Entity`,
            },
        });
    }

    /**
     * Delete Constellation
     * @param constellationId 
     * @returns void Successful Response
     * @throws ApiError
     */
    public static deleteConstellation(
        constellationId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: `/constellations/${constellationId}`,
            errors: {
                404: `Not Found`,
                422: `Validation Error`,
            },
        });
    }
}
