function authenticateInternalService(req, res, next) {
    const providedKey = req.headers["x-internal-service-key"];

    if (
        !providedKey ||
        providedKey !== process.env.INTERNAL_SERVICE_KEY
    ) {
        return res.status(403).json({
            message: "Internal service access denied"
        });
    }

    next();
}

module.exports = {
    authenticateInternalService
};