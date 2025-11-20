
import express from 'express'
import cors from 'cors'
// we use cookie-parser to parse HTTP server cookie parsing and serialization
import cookieParser from 'cookie-parser'
import morganMiddleware from './logger/morgan.logger.js'
const app = express()

// we use, use method of express to use middlewares and for configuration
app.use(cors({
    origin : process.env.CORS_ORIGIN
}))

// here we're configuring the express to allow json requests with a certain limit
app.use(express.json({limit: "16kb"}))

// here we're configuring the express about how to take parameters as request from the user it should be encoded
app.use(express.urlencoded({extended : true, limit : '16kb'}))
app.use(express.static('public'))
// we use cookieParser to access the cookies from user's browser and to set those cookies

app.use(cookieParser())

app.use(morganMiddleware)


// routes imports
import authRouter from './routes/auth.route.js'
import userRouter from './routes/user.route.js'
import taskRouter from './routes/task.route.js'
import noteRouter from './routes/note.route.js'
import projectRouter from './routes/project.route.js'
import dashboardRouter from './routes/dashboard.route.js'
import { errorHandler } from './middlewares/error.middleware.js'

// register routers
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/tasks', taskRouter)
app.use('/api/v1/notes', noteRouter)
app.use('/api/v1/projects', projectRouter)
app.use('/api/v1/dashboard', dashboardRouter)

// Error handler should be the last middleware
app.use(errorHandler)




export {app}