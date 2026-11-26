const { getPool, sql } = require("../config/connectData");

class ActivityRepository {
    async listRecent(limit) {
        const pool = await getPool();
        const request = pool.request();
        request.input("limit", sql.Int, limit);
        const result = await request.query(`
            SELECT TOP (@limit)
              a.id AS [id],
              a.acted_at AS [time],
              a.emp_no AS [userId],
              a.action_key AS [actionKey],
              a.po_number AS [poNumber],
              a.slot_code AS [slotCode],
              CAST(a.qty AS FLOAT) AS [qty],
              a.unit AS [unit],
              a.detail AS [detail]
            FROM whs_activity a
            WHERE a.action_key NOT IN ('ACCOUNT_CREATED', 'ACCOUNT_PASSWORD_RESET')
            ORDER BY a.acted_at DESC
        `);
        return result.recordset;
    }
}

module.exports = new ActivityRepository();
