import { EligibilityRequest } from 'client/index';
import { EligibilityForm } from 'store/thunks/eligibility.thunk';
import { ObjectSchema, bool, mixed, number, object, string } from 'yup';

const schema: ObjectSchema<EligibilityForm> = object().shape({
  stationWithMasks: number().required(),
  step: string()
    .optional()
    .nullable()
    .transform((_, val) => (val !== '' ? val : null)),
  cache: bool().optional(),
  backend: mixed<EligibilityRequest.backend>().required(),
});

export default schema;
