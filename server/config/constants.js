export const DB_MSG = {
    CONNECTED : "Database connection successfull.",
    CONNECTION_FAILED: "Database connection failed."
}

export const APP_MSG = {
    HEALTH_CHECK_SUCCESS: "Backend connected successfully.",
}

export const AUTH_MSG = {
    VALIDATION_FAILED: "Validation failed.",
    AUTH_REQUIRED: "Authentication required.",
    INVALID_TOKEN: "Invalid authentication token.",
    USER_NOT_FOUND: "User not found.",
    INVALID_OR_EXPIRED_TOKEN: "Invalid or expired authentication token.",
    TOO_MANY_ATTEMPTS: "Too many authentication attempts. Please try again later.",
    ACCOUNT_CREATED: "Account created successfully.",
    CHECK_EMAIL: "Check your email for the verification code.",
    LOGIN_SUCCESS: "Logged in successfully.",
    LOGOUT_SUCCESS: "Logged out successfully.",
    INVALID_CREDENTIALS: "Invalid email or password.",

    EMAIL_EXISTS: "An account with this email already exists.",
    USERNAME_TAKEN: "This username is already taken.",
    EMAIL_ALREADY_VERIFIED: "Email is already verified.",
    EMAIL_VERIFICATION_OTP_SENT: "Verification code has been sent to your email.",
    EMAIL_VERIFICATION_OTP_RESENT: "Verification code has been resent to your email.",
    EMAIL_VERIFICATION_REQUEST_INVALID: "Invalid or expired verification request.",
    EMAIL_VERIFICATION_OTP_INVALID: "Invalid verification code.",
    EMAIL_VERIFICATION_OTP_VERIFIED: "Email verified successfully.",
    EMAIL_VERIFICATION_LOCAL_ONLY: "Email verification is only available for local sign-in users.",
    EMAIL_NOT_VERIFIED: "Please verify your email before logging in.",
    EMAIL_VERIFICATION_SEND_FAILED: "Unable to send verification email.",
    EMAIL_VERIFICATION_RESEND_FAILED: "Unable to resend verification email.",
    EMAIL_VERIFICATION_RESEND_TOO_SOON: "Please wait before requesting another code.",
    EMAIL_VERIFICATION_RESEND_LIMIT_REACHED: "You have requested too many verification codes.",
}

export const VALIDATION_MSG = {
    USERNAME_MIN: "Username must be at least 3 characters long.",
    USERNAME_MAX: "Username must be at most 30 characters long.",
    USERNAME_PATTERN: "Username can only contain letters, numbers, dots, underscores, and hyphens.",
    EMAIL_INVALID: "Please provide a valid email address.",
    PASSWORD_MIN: "Password must be at least 8 characters long.",
    PASSWORD_MAX: "Password must be at most 128 characters long.",
    PASSWORD_REQUIRED: "Password is required.",
    REQUEST_ID_INVALID: "Please provide a valid verification request id.",
    OTP_INVALID: "Please provide a valid 6 digit verification code.",
    PROJECT_NAME_MIN: "Project name must be at least 3 characters long.",
    PROJECT_NAME_MAX: "Project name must be at most 100 characters long.",
    PROJECT_DESC_MAX: "Project description must be at most 500 characters long.",
    AT_LEAST_ONE_FIELD: "At least one field must be provided.",
    SEARCH_QUERY_MIN: "Search query must be at least 1 character long.",
    SEARCH_QUERY_MAX: "Search query must be at most 100 characters long.",
    INVALID_USER_ID: "Please provide a valid user ID.",
}

export const MAIL_MSG = {
    OTP_SUBJECT: "Your Helios verification code",
}

export const PROJECT_MSG = {
    CREATED: "Project created successfully.",
    DELETED: "Project deleted successfully.",
    NOT_FOUND: "Project not found.",
    NOT_MEMBER: "You are not a member of this project.",
    NOT_OWNER: "Only the project owner can perform this action.",
}

export const INVITATION_MSG = {
    SENT: "Invitation sent successfully.",
    ALREADY_MEMBER: "This user is already a member of the project.",
    ALREADY_INVITED: "This user already has a pending invitation to this project.",
    NOT_FOUND: "Invitation not found.",
    ALREADY_RESPONDED: "This invitation has already been responded to.",
    ACCEPTED: "Invitation accepted.",
    REJECTED: "Invitation rejected.",
}