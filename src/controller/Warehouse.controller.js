const WarehouseServices = require("../services/Warehouse.service");

exports.getBootstrap = async (req, res, next) => {
    try {
        // Trả trực tiếp DTO để FE hiện tại đọc các trường ở cấp gốc.
        return res.json(await WarehouseServices.getBootstrap());
    } catch (error) {
        return next(error);
    }
};
