const { getPool, sql } = require("../config/connectData");

class SlotRepository {
    async list() {
        const pool = await getPool();
        const request = pool.request();
        const result = await request.query(`
            SELECT s.code, s.warehouse, s.slot_row AS [row], s.floor, s.position,
                   s.keeper_emp_no AS keeperId, s.locked, s.is_full AS [full], s.active
            FROM whs_slots s
            ORDER BY s.code
        `);
        return result.recordset;
    }

    async listByKeeper(empNo) {
        const pool = await getPool();
        const request = pool.request();
        request.input("empNo", sql.NVarChar(20), empNo);
        const result = await request.query(`
            SELECT s.code, s.warehouse, s.slot_row AS [row], s.floor, s.position,
                   s.keeper_emp_no AS keeperId, s.locked, s.is_full AS [full], s.active
            FROM whs_slots s
            WHERE s.keeper_emp_no = @empNo
            ORDER BY s.code
        `);
        return result.recordset;
    }
}

module.exports = new SlotRepository();
