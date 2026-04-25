const logger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const ms = Date.now() - start;
        const color = res.statusCode >= 500 ? '\x1b[31m' // Red
                    : res.statusCode >= 400 ? '\x1b[33m' // Yellow
                    : res.statusCode >= 300 ? '\x1b[36m' // Cyan
                    : '\x1b[32m'; // Green
        
        console.log(`[HTTP] ${req.method} ${req.originalUrl} ${color}${res.statusCode}\x1b[0m - ${ms}ms - ${req.ip}`);
    });

    next();
};

module.exports = logger;
