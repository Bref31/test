/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Eligibility } from '../models/Eligibility';
import type { EligibilityRequest } from '../models/EligibilityRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class EligibilitiesService {

    /**
     * Api Compute Eligibilities
     * @param requestBody 
     * @returns Eligibility Successful Response
     * @throws ApiError
     */
    public static computeEligibilities(
requestBody: EligibilityRequest,
): CancelablePromise<Array<Eligibility>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/eligibilities/compute',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Unprocessable Entity`,
            },
        });
    }

}
