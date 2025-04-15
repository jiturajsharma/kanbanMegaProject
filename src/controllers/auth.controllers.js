import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { User } from '../models/user.models.js';
import jwt from 'jsonwebtoken';

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


