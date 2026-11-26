const AuthServices = require("../services/Auth.service");

exports.login = async (req, res, next) => {
    try {
        return res.json(await AuthServices.login(req.body));
    } catch (error) {
        return next(error);
    }
};

exports.logout = (req, res) => res.json(AuthServices.logout(req.user));

exports.me = async (req, res, next) => {
    try {
        return res.json(await AuthServices.me(req.user));
    } catch (error) {
        return next(error);
    }
};
