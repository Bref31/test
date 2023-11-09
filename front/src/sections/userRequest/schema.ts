import { mixed, object } from 'yup';

const MAX_FILE_SIZE = 102400; //100KB

export default object().shape({
  userRequest: mixed()
    .required('File is required')
    .test(
      'is-valid-type',
      'Not a CSV file.',
      (value: any) =>
        value && value.name && value.name.slice(-3).toUpperCase() === 'CSV',
    )
    .test(
      'is-valid-size',
      'Max allowed size is 100KB.',
      (value: any) => value && value.size <= MAX_FILE_SIZE,
    ),
});
