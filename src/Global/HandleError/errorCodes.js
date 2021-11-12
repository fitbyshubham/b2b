export const ErrorCodes = {
  default: {
    title: 'Something went wrong!',
    detail: "Can't understand what went wrong. Please contact support",
    status: 500,
  },
  invalid_params: {
    title: 'Invalid parameters',
    detail: 'Please check the entered data',
    status: 400,
  },
  method_not_allowed: {
    title: 'Method not allowed',
    detail:
      'This method is not supported or not allowed. Please contact support',
    status: 405,
  },
  forbidden: {
    title: 'Forbidden',
    detail: 'You cannot access this resource. Please contact support',
    status: 403,
  },
  not_found: {
    title: 'Not found.',
    detail: 'This resource is unavailable',
    status: 404,
  },
  cp_wrong_password: {
    title: 'Wrong password',
    detail: 'The password that you entered is not correct',
    status: 400,
  },
  token_not_valid: {
    title: 'Login expired',
    detail: 'Login has expired',
    status: 401,
  },
  invalid_id_token: {
    title: 'Invalid `id_token`.',
    detail: 'Social login failed, please try again',
    status: 400,
  },
  social_exists: {
    title: 'Social already exists.',
    detail: 'User with this account already exists',
    status: 400,
  },
  duplicate_email: {
    title: 'Email already exists.',
    detail: 'User with this email already exists',
    status: 400,
  },
  duplicate_phone_number: {
    title: 'Phone number already exists',
    detail: 'User with this phone number already exists',
    status: 400,
  },
  not_in_deactivated_state: {
    title: 'Not in deactivated state.',
    detail: 'User is already active',
    status: 400,
  },
  not_in_activated_state: {
    title: 'Not in activated state.',
    detail: 'User is already inactive',
    status: 400,
  },
  action_denied_on_admin: {
    title: 'Action denied on admin.',
    detail: 'This action cannot be performed on a user with role admin',
    status: 400,
  },
  no_user_found: {
    title: 'No user found.',
    detail: 'No account found with this email address',
    status: 400,
  },
  no_active_account: {
    title: 'No active account found.',
    detail: "You don't have an account with these credentials",
    status: 401,
  },
  user_already_verified: {
    title: 'User already verified.',
    detail: 'This account is already verified',
    status: 400,
  },
  invalid_expired_token: {
    title: 'Invalid or expired token.',
    detail: 'Token is invalid or expired',
    status: 400,
  },
  no_otp_found: {
    title: 'No OTP found.',
    detail:
      'No OTP available for this account. Please request OTP and try again',
    status: 400,
  },
  expired_otp: {
    title: 'Incorrect or expired OTP.',
    detail: 'The OTP has expired. Please request OTP again',
    status: 400,
  },
  incorrect_otp: {
    title: 'Incorrect OTP.',
    detail: 'The OTP is incorrect. Please try again with the correct OTP',
    status: 400,
  },
  unsupported_contact: {
    title: 'Unsupported contact.',
    detail: 'The contact type is not supported. It can be either E or P',
    status: 400,
  },
  no_batch_specified: {
    title: 'Batch not specified.',
    detail: 'Batch id not found in the request',
    status: 400,
  },
  request_present: {
    title: 'Request already present.',
    detail: 'Request for the user for this batch is already present',
    status: 400,
  },
  active_lecture: {
    title: 'Request already present.',
    detail: 'Request for the user for this batch is already present',
    status: 400,
  },
  attendance_not_recorded: {
    title: 'Attendance not recorded.',
    detail: 'Attendance for this lecture has not been recorded',
    status: 400,
  },
  multiple_scheduled_lecture: {
    title: 'Multiple scheduled lecture on same day.',
    detail:
      'There cannot be multiple scheduled lecture on same day. Contact support',
    status: 500,
  },
  no_active_lecture: {
    title: 'No active lecture found.',
    detail: 'No lecture is active for the batch',
    status: 400,
  },
  lecture_not_active: {
    title: 'Lecture not active.',
    detail: 'You cannot join a lecture that is not active',
    status: 400,
  },
  poll_expired: {
    title: 'Poll expired.',
    detail: 'Polls have a time limit, you cannot answer once it has passed',
    status: 400,
  },
}
