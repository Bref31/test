import { GroundSegmentCreate } from 'client/index';
import { ObjectSchema, array, number, object, string } from 'yup';

const schema: ObjectSchema<GroundSegmentCreate> = object().shape({
  name: string().required('Field is required'),
  stations: array()
    .of(
      object().shape({
        id: number().required(),
        country: string().optional(),
        city: string().optional(),
        location: object().required().shape({
          longitudeDeg: number().required(),
          latitudeDeg: number().required(),
          heightM: number().optional(),
        }),
      }),
    )
    .required()
    .min(1),
});

export default schema;
