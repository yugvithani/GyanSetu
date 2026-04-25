const validateBody = (requiredFields = []) => {
    return (req, res, next) => {
        const missingFields = requiredFields.filter(field => !req.body[field] && req.body[field] !== false && req.body[field] !== 0);
        
        if (missingFields.length > 0) {
            res.status(400);
            return next(new Error(`Missing required fields: ${missingFields.join(", ")}`));
        }

        // Basic HTML/Script sanitizer for all top-level string fields
        // This is a minimal implementation of an industry-standard sanitizer
        for (const [key, value] of Object.entries(req.body)) {
            if (typeof value === "string") {
                // Strip out dangerous HTML tags (e.g. <script>, <iframe>)
                req.body[key] = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                                     .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
            }
        }

        next();
    };
};

module.exports = { validateBody };
