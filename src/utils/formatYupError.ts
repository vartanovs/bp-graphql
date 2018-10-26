import { ValidationError } from "yup";

/**
 * Simplifies yup error objects, extracting just Path and Message
 * @param {ValidationError} err Complex error object generated by yup
 * @returns Array of simplified error objects { path, message }
 */
export const formatYupError = (err: ValidationError) => {
  // Declare an array to hold simplified error objects
  const errorArray: Array<{ path: string; message: string }> = [];
  // Populate array by traversing err.inner, extracting path and message
  err.inner.forEach(e => {
    errorArray.push({
      path: e.path,
      message: e.message,
    })
  });
  // Return array of simplified error objects
  return errorArray;
};