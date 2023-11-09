/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { System } from '../models/System';
import type { SystemCreate } from '../models/SystemCreate';
import type { SystemInfo } from '../models/SystemInfo';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SystemsService {

    /**
     * List Systems
     * @returns SystemInfo Successful Response
     * @throws ApiError
     */
    public static listSystems(): CancelablePromise<Array<SystemInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/systems/',
        });
    }

    /**
     * Get System
     * @param systemId 
     * @returns System Successful Response
     * @throws ApiError
     */
    public static getSystem(
systemId: number,
): CancelablePromise<System> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/systems/{system_id}',
            path: {
                'system_id': systemId,
            },
            errors: {
                404: `Not Found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Create System
     * @param requestBody 
     * @returns System Successful Response
     * @throws ApiError
     */
    public static createSystem(
requestBody: SystemCreate,
): CancelablePromise<System> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/systems/create',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Unprocessable Entity`,
            },
        });
    }

    /**
     * Delete System
     * @param systemId 
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteSystem(
systemId: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/systems/delete/{system_id}',
            path: {
                'system_id': systemId,
            },
            errors: {
                404: `Not Found`,
                422: `Validation Error`,
            },
        });
    }

}
