const ApiError=require('../utils/ApiError');
function notFound(req,res,next){ next(ApiError.NotFound(`Không tìm thấy ${req.method} ${req.originalUrl}`)); }
function errorHandler(err,req,res,next){
  if (res.headersSent) return next(err);
  const status=Number(err.status)||500;
  if (status>=500) console.error('[ERROR]',err);
  return res.status(status).json({success:false,message:status===500?'Internal Server Error':err.message,errors:err.errors||[]});
}
module.exports={notFound,errorHandler};

// Contract lỗi của các endpoint xác thực kho được FE hiện tại đọc trực tiếp.
module.exports.warehouseErrorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  const isApiError = error instanceof ApiError;
  const timedOut = error.code === "ETIMEOUT";
  const status = isApiError ? error.status : timedOut ? 504 : 500;

  if (status >= 500) console.error("[WAREHOUSE ERROR]", error);
  const message = isApiError ? error.message : timedOut ? "sql_query_timeout" : "internal_error";
  const code = isApiError
    ? error.code ?? "BUSINESS_ERROR"
    : timedOut ? "sql_query_timeout" : "INTERNAL_ERROR";

  return res.status(status).json({ error: { code, message, timestamp: Date.now() } });
};
