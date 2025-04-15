import { body } from 'express-validator'
import { AvailableUserRoles } from '../utils/constants.js'

const userRegistrationValidator = () =>{
    return [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email is invalid"),
        body("password").trim().notEmpty().withMessage("Password is required"),
    body("role")
        .optional()
        .isIn(AvailableUserRoles)
        .withMessage("Invalid user role"),
    body("username")
        .trim()
        .notEmpty()
        .withMessage("username is required")
        .isLength({min: 3})
        .withMessage("username should be at least 3 cha")
        .isLength({max: 3})
        .withMessage("username cannot exceed 13 char")
    ]
}

const userLoginValidator = () => {
    return [
        body("email").optional().isEmail().withMessage("Email is invalid"),
        body("username").optional(),
        body("password").notEmpty().withMessage("Password is required"),
    ];
};

const userChangeCurrentPasswordValidator = () => {
    return [
        body("oldPassword").notEmpty().withMessage("Old password is required"),
        body("newPassword").notEmpty().withMessage("New password is required"),
    ];
};

const userForgotPasswordValidator = () => {
    return [
        body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email is invalid"),
    ];
};

const userResetForgottenPasswordValidator = () => {
    return [body("newPassword").notEmpty().withMessage("Password is required")];
};

const userAssignRoleValidator = () => {
    return [
        body("role")
        .optional()
        .isIn(AvailableUserRoles)
        .withMessage("Invalid user role"),
    ];
};

export { 
    userRegistrationValidator, 
    userLoginValidator, 
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgottenPasswordValidator,
    userAssignRoleValidator
}