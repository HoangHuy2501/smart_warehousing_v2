const AuthServices = require("../services/Auth.service");
const ApiError = require("../utils/ApiError");

exports.requireAuth = (req, res, next) => {
    const token = AuthServices.verify(req.get("x-auth-token"));
    if (!token) {
        const error = ApiError.Unauthorized("unauthorized");
        error.code = "unauthorized";
        return next(error);
    }
    req.user = token;
    return next();
};

exports.requireCredentials = (req, res, next) => {
    const missing = ["empNo", "password"].filter((key) => req.body?.[key] == null || req.body[key] === "");
    if (missing.length === 0) return next();

    const error = ApiError.BadRequest(`missing_fields: ${missing.join(", ")}`);
    error.code = "VALIDATION_ERROR";
    return next(error);
};
