import express from 'express'

const app = express()

// import routes
import healthChecker from './routes/healthcheck.routes.js'
app.use("api/v1/healthcheck", healthChecker)

export default app;
