const services=require('../services/AuthServices');
const ApiSuccess=require('../utils/ApiSuccess');
exports.Register=async(req,res)=>res.status(201).json(ApiSuccess.created('Đăng ký thành công',await services.register(req.body)));
exports.Login=async(req,res)=>res.json(ApiSuccess.getSelect('Đăng nhập thành công',await services.login(req.body)));
