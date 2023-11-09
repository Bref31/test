/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Topology } from '../models/Topology';
import type { TopologyCreate } from '../models/TopologyCreate';
import type { TopologyInfo } from '../models/TopologyInfo';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TopologiesService {

    /**
     * List Topologies For Constellation
     * @param constellationId 
     * @returns TopologyInfo Successful Response
     * @throws ApiError
     */
    public static listTopologiesForConstellation(
constellationId: number,
): CancelablePromise<Array<TopologyInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/topologies/list',
            query: {
                'constellation_id': constellationId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Topology
     * @param topologyId 
     * @returns Topology Successful Response
     * @throws ApiError
     */
    public static getTopology(
topologyId: number,
): CancelablePromise<Topology> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/topologies/{topology_id}',
            path: {
                'topology_id': topologyId,
            },
            errors: {
                404: `Not Found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Create Topology
     * @param requestBody 
     * @returns Topology Successful Response
     * @throws ApiError
     */
    public static createTopology(
requestBody: TopologyCreate,
): CancelablePromise<Topology> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/topologies/create',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Unprocessable Entity`,
            },
        });
    }

}
