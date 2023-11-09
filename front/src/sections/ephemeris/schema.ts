import { EphemerisForm } from 'store/thunks/ephemeris.thunk';
import { ObjectSchema, bool, mixed, object, string } from 'yup';

const schema: ObjectSchema<EphemerisForm> = object().shape({
  velocity: bool().optional(),
  cache: bool().optional(),
  backend: mixed().optional(),
  horizon: object()
    .shape({
      start: string()
        .required('Field is required')
        .test((date) => date !== 'Invalid date'),
      end: string()
        .required('Field is required')
        .test((date) => date !== 'Invalid date'),
      step: string().required('Field is required'),
    })
    .test((value) => value.end > value.start),
});

export default schema;
