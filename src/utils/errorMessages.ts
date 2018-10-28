export const errorMessages = {
  login: {
    invalidLogin: 'Error - email and password must be valid',
    lockedAccount: 'Error - account is locked',
    unconfirmedEmail: 'Error - email must be confirmed',
  },
  register: {
    duplicateEmail: 'Error - email address already taken',
    emailTooShort: 'Error - email must be at least 3 characters',
    emailInvalid: 'Error - email must be a valid email',
    passwordTooShort: 'Error - password must be at least 3 characters',
  },
  forgotPassword: {
    invalidEmail: 'Error - account not found',
    invalidKey: 'Error - link no longer valid',
    passwordTooShort: 'Error - password must be at least 3 characters',
  }
};
