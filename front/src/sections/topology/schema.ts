import { TopologyCreate } from 'client/index';
import { ObjectSchema, boolean, mixed, number, object, string } from 'yup';

const schema: ObjectSchema<TopologyCreate> = object()
  .shape({
    constellationId: number().required('Filed is required'),
    name: string().required('Filed is required'),
    parameters: object()
      .required()
      .shape({
        mode: mixed().required(),
        intraPlane: boolean().required(),
        interPlane: boolean().required(),
        shiftIndex: number()
          .integer()
          .nullable()
          // checking self-equality works for NaN, transforming it to null
          .transform((_, val) => (val === Number(val) ? val : null)),
        excludeSeam: boolean().optional(),
      }),
  })
  .test('check-atleast-one-plane', (value) => {
    return value.parameters.intraPlane || value.parameters.interPlane;
  });

export default schema;
