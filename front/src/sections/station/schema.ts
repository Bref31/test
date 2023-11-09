import { StationCreate } from 'client/index';
import { ObjectSchema, number, object, string } from 'yup';

const schema: ObjectSchema<StationCreate> = object().shape({
  country: string().optional(),
  city: string().optional(),
  location: object().required().shape({
    longitudeDeg: number().required(),
    latitudeDeg: number().required(),
    heightM: number().optional(),
  }),
});

export default schema;
