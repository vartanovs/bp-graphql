import { ValidationError } from "yup";

export const formatYupError = (err: ValidationError) => {
  const errorArray: Array<{ path: string; message: string }> = [];
  err.inner.forEach(e => {
    errorArray.push({
      path: e.path,
      message: e.message,
    })
  });

  return errorArray;
};
