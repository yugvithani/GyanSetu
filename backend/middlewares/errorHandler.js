const errorHandler = (err, req, res, next) => {
    // Determine the status code - default to 500 if not set
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    // Log the error to the console (for developer visibility)
    console.error(`[Error] ${req.method} ${req.url} >> ${err.message}`);
    // console.error(err.stack); // Uncomment for deeper debugging in production

    res.status(statusCode).json({
        error: err.message || "Internal Server Error",
        // Only return stack trace if we are in development
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};

module.exports = errorHandler;
