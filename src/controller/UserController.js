const services=require('../services/UserServices');
const ApiSuccess=require('../utils/ApiSuccess');
const ApiError=require('../utils/ApiError');
function checkOwner(req){if(req.user.role!=='Admin' && Number(req.user.userId)!==Number(req.params.id)) throw ApiError.Forbidden('Chỉ được thao tác tài khoản của chính mình');}
exports.GetAll=async(req,res)=>res.json(ApiSuccess.getSelect('Danh sách user',await services.getAll()));
exports.GetById=async(req,res)=>{checkOwner(req);return res.json(ApiSuccess.getSelect('Chi tiết user',await services.getById(Number(req.params.id))));};
exports.Update=async(req,res)=>{checkOwner(req);return res.json(ApiSuccess.updated('Đã cập nhật',await services.updateName(Number(req.params.id),req.body.name)));};
exports.Delete=async(req,res)=>{await services.delete(Number(req.params.id));return res.json(ApiSuccess.deleted('Đã xóa user'));};
