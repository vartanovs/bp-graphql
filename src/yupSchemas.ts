import * as yup from 'yup';
import { errorMessages } from './utils/errorMessages';

// Password Validation for multiple modules
export const passwordValidation = yup
  .string()
  .min(3, errorMessages.register.passwordTooShort)
  .max(255);
