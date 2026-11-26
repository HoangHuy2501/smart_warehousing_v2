const { getPool, sql } = require("../config/connectData");

class AccountRepository {
    async list() {
        const pool = await getPool();
        const request = pool.request();
        const result = await request.query(`
            SELECT
              r.emp_no AS [id],
              e.emp_name AS [name],
              r.emp_no AS [employeeCode],
              CAST(NULL AS NVARCHAR(255)) AS [email],
              r.role AS [role],
              r.locked AS [locked]
            FROM whs_user_role r
            LEFT JOIN bas_emp e ON e.emp_no = r.emp_no
            ORDER BY r.emp_no
        `);
        return result.recordset;
    }

    async findByEmployeeCode(empNo) {
        const pool = await getPool();
        const request = pool.request();
        request.input("empNo", sql.NVarChar(20), empNo);
        const result = await request.query(`
            SELECT
              r.emp_no AS [id],
              e.emp_name AS [name],
              r.emp_no AS [employeeCode],
              CAST(NULL AS NVARCHAR(255)) AS [email],
              r.role AS [role],
              r.locked AS [locked],
              r.password AS [password],
              r.active AS [active]
            FROM whs_user_role r
            LEFT JOIN bas_emp e ON e.emp_no = r.emp_no
            WHERE r.emp_no = @empNo
        `);
        return result.recordset;
    }
}

module.exports = new AccountRepository();
