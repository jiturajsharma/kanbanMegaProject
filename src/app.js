import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'


dotenv.config()

const app = express()

app.use(cors({
    origin : process.env.BASE_URL,
    credentials: true,
    methods : ['GET','POST','DELETE','OPTIONS'],
    allowedHeaders : ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())


// import routes
import healthChecker from './routes/healthcheck.routes.js'
import userRoutes from './routes/auth.routes.js'

app.use("/api/v1/healthcheck", healthChecker)
app.use("/api/v1/users", userRoutes)





export default app;
