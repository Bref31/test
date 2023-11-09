/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GroundSegment } from '../models/GroundSegment';
import type { GroundSegmentCreate } from '../models/GroundSegmentCreate';
import type { GroundSegmentInfo } from '../models/GroundSegmentInfo';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class GroundSegmentsService {

    /**
     * List Ground Segments
     * @returns GroundSegmentInfo Successful Response
     * @throws ApiError
     */
    public static listGroundSegments(): CancelablePromise<Array<GroundSegmentInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/ground-segments/',
        });
    }

    /**
     * Get Ground Segment
     * @param groundSegmentId 
     * @returns GroundSegment Successful Response
     * @throws ApiError
     */
    public static getGroundSegment(
groundSegmentId: number,
): CancelablePromise<GroundSegment> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/ground-segments/{ground_segment_id}',
            path: {
                'ground_segment_id': groundSegmentId,
            },
            errors: {
                404: `Not Found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Create Ground Segment
     * @param requestBody 
     * @returns GroundSegment Successful Response
     * @throws ApiError
     */
    public static createGroundSegment(
requestBody: GroundSegmentCreate,
): CancelablePromise<GroundSegment> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/ground-segments/create',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
