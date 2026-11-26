const { getPool, sql } = require("../config/connectData");

class MaterialRepository {
    async listByKeeper(empNo) {
        const pool = await getPool();
        const request = pool.request();
        request.input("empNo", sql.NVarChar(20), empNo);
        const result = await request.query(`
            SELECT
              g.goods_no AS [goodsNo],
              g.goods_name AS [goodsName],
              a.keeper_emp_no AS [keeperEmpNo],
              e.emp_name AS [keeperName],
              a.assigned_at AS [assignedAt]
            FROM whs_keeper_material_assignment a
            JOIN bas_goods g ON g.goods_no = a.goods_no
            LEFT JOIN bas_emp e ON e.emp_no = a.keeper_emp_no
            WHERE a.keeper_emp_no = @empNo
              AND a.ended_at IS NULL
            ORDER BY g.goods_no
        `);
        return result.recordset;
    }
}

module.exports = new MaterialRepository();
