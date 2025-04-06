import {ApiResponse} from '../utils/api-response.js'

const healthCheck = (req, res) => {
    console.log("helathcheck is going on.....")
    res.status(200).json(new ApiResponse(200, { message: "Server is running "})
    )
}

export  { healthCheck }