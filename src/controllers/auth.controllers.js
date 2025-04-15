import { body } from 'express-validator';
import { asyncHandler } from '../utils/async-handler.js'
import { userRegistrationValidator } from '../validators/index.js';
import { body } from '../models/user.models.js'

const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password, role } = req.body;

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists", []);
    }
    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false,
        role: role || UserRolesEnum.USER,
    });

export { registerUser }
