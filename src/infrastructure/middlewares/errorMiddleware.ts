import {Request, Response, NextFunction} from "express"

interface Error{
    statusCode?: number, 
    message?: string
}

const errorMiddleware =  (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log("Inside middleware")
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error"
    console.log(err);
    res.status(statusCode).json({success: false, message})
}

export default errorMiddleware