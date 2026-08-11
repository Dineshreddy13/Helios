// src/utils/authValidation.js

import { AUTH_CONSTANTS } from '../constants/auth.constants';

export const authValidation = {
    username: {
        required: 'Username is required',
        minLength: {
            value: AUTH_CONSTANTS.USERNAME_MIN_LENGTH,
            message: `Username must be at least ${AUTH_CONSTANTS.USERNAME_MIN_LENGTH} characters`,
        },
        maxLength: {
            value: AUTH_CONSTANTS.USERNAME_MAX_LENGTH,
            message: `Username must be at most ${AUTH_CONSTANTS.USERNAME_MAX_LENGTH} characters`,
        },
        pattern: {
            value: AUTH_CONSTANTS.USERNAME_REGEX,
            message:
                'Only letters, numbers, dots, underscores and hyphens allowed',
        },
    },

    email: {
        required: 'Email is required',
        pattern: {
            value: AUTH_CONSTANTS.EMAIL_REGEX,
            message: 'Invalid email address',
        },
    },

    password: {
        required: 'Password is required',
        minLength: {
            value: AUTH_CONSTANTS.PASSWORD_MIN_LENGTH,
            message: `Password must be at least ${AUTH_CONSTANTS.PASSWORD_MIN_LENGTH} characters`,
        },
        maxLength: {
            value: AUTH_CONSTANTS.PASSWORD_MAX_LENGTH,
            message: 'Password is too long',
        },
    },
};