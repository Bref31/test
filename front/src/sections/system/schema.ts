import { SystemCreate } from 'client/index';
import { ObjectSchema, array, number, object, string } from 'yup';

const schema: ObjectSchema<SystemCreate> = object().shape({
  name: string().required('Field is required'),
  constellationIds: array().of(number().required()).required().min(1),
});

export default schema;
