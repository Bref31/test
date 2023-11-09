/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_import_stations } from '../models/Body_import_stations';
import type { Station } from '../models/Station';
import type { StationCreate } from '../models/StationCreate';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class StationsService {

    /**
     * List Stations
     * @returns Station Successful Response
     * @throws ApiError
     */
    public static listStations(): CancelablePromise<Array<Station>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/stations/',
        });
    }

    /**
     * Get Station
     * @param stationId 
     * @returns Station Successful Response
     * @throws ApiError
     */
    public static getStation(
stationId: number,
): CancelablePromise<Station> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/stations/{station_id}',
            path: {
                'station_id': stationId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Create Station
     * @param requestBody 
     * @returns Station Successful Response
     * @throws ApiError
     */
    public static createStation(
requestBody: StationCreate,
): CancelablePromise<Station> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/stations/create',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Create Stations
     * @param requestBody 
     * @returns Station Successful Response
     * @throws ApiError
     */
    public static createStations(
requestBody: Array<StationCreate>,
): CancelablePromise<Array<Station>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/stations/create-many',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Unprocessable Entity`,
            },
        });
    }

    /**
     * Import Stations
     * @param formData 
     * @returns Station Successful Response
     * @throws ApiError
     */
    public static importStations(
formData: Body_import_stations,
): CancelablePromise<Array<Station>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/stations/import',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Unprocessable Entity`,
            },
        });
    }

}
