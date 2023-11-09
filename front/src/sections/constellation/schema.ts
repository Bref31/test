import { ConstellationCreate } from 'client/index';
import { ObjectSchema, mixed, number, object, string } from 'yup';

const REQUIRED_S = 'Field is required.';
const INTEGER_S = 'Field should be an integer.';
const NUMBER_S = 'Field should be an number.';

const schema: ObjectSchema<ConstellationCreate> = object().shape({
  name: string().required(REQUIRED_S),
  nPlanes: number()
    .typeError(INTEGER_S)
    .min(1, 'At least one plane required.')
    .integer(INTEGER_S)
    .required(REQUIRED_S),
  nPerPlane: number()
    .typeError(INTEGER_S)
    .min(1, 'At least one satellite per plane required.')
    .integer(INTEGER_S)
    .required(REQUIRED_S),
  orbitParameters: object({
    mode: mixed<'telesat' | 'walker' | 'true-anomaly-shift'>().required(REQUIRED_S),
    semiMajorAxisKm: number()
      .typeError(NUMBER_S)
      .min(0, 'Semi-major axis should be positive.')
      .required(REQUIRED_S),
    inclinationDeg: number().typeError(NUMBER_S).required(REQUIRED_S),
    trueAnomalyPeriodDeg: number()
      .typeError(NUMBER_S)
      .when('mode', {
        is: 'telesat',
        then: (s) => s.required(),
        otherwise: (schema) => schema.transform(() => undefined),
      }),
    relativeSpacing: number()
      .typeError(INTEGER_S)
      .integer(INTEGER_S)
      .when('mode', {
        is: 'walker',
        then: (s) => s.required(),
        otherwise: (schema) => schema.transform(() => undefined),
      }),
    trueAnomalyDeltaDeg: number()
      .typeError(NUMBER_S)
      .when('mode', {
        is: 'true-anomaly-shift',
        then: (s) => s.required(),
        otherwise: (schema) => schema.transform(() => undefined),
      }),
    eccentricity: number()
      .typeError('Eccentricity must be a number within [0, 1].')
      .min(0, 'Eccentricity must be within [0, 1].')
      .max(1, 'Eccentricity must be within [0, 1].')
      .required(REQUIRED_S),
    argumentOfPerigeeDeg: number().integer(INTEGER_S).required(REQUIRED_S),
    epoch: string()
      .required(REQUIRED_S)
      .test((date) => date !== 'Invalid date'),
    raanBaseDeg: number().integer(INTEGER_S).required(REQUIRED_S),
    raanSpacingDeg: number()
      .integer()
      .min(0)
      .nullable()
      // checking self-equality works for NaN, transforming it to null
      .transform((_, val) => (val === Number(val) ? val : null)),
  }),
});

export default schema;
