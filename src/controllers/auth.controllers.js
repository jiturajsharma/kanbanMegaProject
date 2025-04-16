import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { User } from '../models/user.models.js';
import jwt from 'jsonwebtoken';
import { mailgen,
    emailVerificationmailgenContent,
    forgotPasswordmailgenContent} from '../utils/mail.js'



// Utils: Generate Tokens
const generateTokens = async (user) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Set refresh token expiry to 30 days
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

// Controller: Refresh Access Token
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, 'Unauthorized request, please login again');
    }

    let decoded;
    try {
        decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, 'Refresh token is invalid or has been rotated');
    }

    // Check if refresh token is expired
    if (new Date() > user.refreshTokenExpiry) {
        throw new ApiError(401, 'Refresh token expired. Please login again.');
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    res
        .status(200)
        .cookie('accessToken', accessToken, cookieOptions)
        .cookie('refreshToken', refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, { accessToken, refreshToken }, 'Access token refreshed successfully')
        );
});

const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password, fullname } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ username: username.toLowerCase() }, { email }]
    });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // Create the user
    const newUser = await User.create({
        username: username.toLowerCase(),
        email,
        fullname,
        password,
    });

    // Get created user without password
    const createdUser = await User.findById(newUser._id).select("-password");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // Generate email verification token
    const { hashedToken, unHashedToken, tokenExpiry } = createdUser.generateTemporaryToken();

    createdUser.emailverificationToken = hashedToken;
    createdUser.emailverificationTokenExpiry = tokenExpiry;


    await createdUser.save({ validateBeforeSave: true });

    // Construct verification URL
    const verificationUrl = `${process.env.BASE_URL}/api/v1/users/verify-email/?token=${unHashedToken}`;

    // Generate email content
    const emailContent = emailVerificationmailgenContent(createdUser.username, verificationUrl);
console.log(emailContent)
    // Send verification email
    await mailgen({
        email: createdUser.email,
        subject: "Verify your email",
        mailgenContent: emailContent
    });

    // Respond to client
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});


const verifyEmail = asyncHandler(async (req, res) =>{
    const {token} = req.query
    if(!token){
        throw new ApiError(400, "Your token has expired. Request to verify your email again")
    }
})
console.log(verifyEmail)





export {
    registerUser,
    verifyEmail
}