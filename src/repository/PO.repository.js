const { getPool } = require("../config/connectData");

class PORepository {
    async listIncoming() {
        const pool = await getPool();
        const request = pool.request();
        const result = await request.query(`
            WITH PoRows AS (
              SELECT o2.id AS po_id, o2.sheet_id AS po_sheet_id,
                     o1.sheet_no, o2.goods_no, o1.su_name11, o2.sheet_qty,
                     o2.unit_no, o2.sheet_pri, o1.check_sta, o2.del_date
              FROM pur_order2 o2
              JOIN pur_order1 o1 ON o1.sheet_no = o2.sheet_no
              JOIN sys_userpass u ON u.user_no = o1.create_user AND u.user_name <> 'ADM'
              WHERE o1.close_sw IN ('N', '0')
                AND o1.sheet_sta <> '0'
                AND (
                  o2.goods_no LIKE 'M1%' OR o2.goods_no LIKE 'M2%'
                  OR o2.goods_no LIKE 'M3%' OR o2.goods_no LIKE 'M4%'
                  OR o2.goods_no LIKE 'M5%' OR o2.goods_no LIKE 'M6%'
                  OR o2.goods_no LIKE 'A2%'
                )
            )
            SELECT
              CAST(p.po_id AS VARCHAR(20)) AS [id],
              p.sheet_no AS [poNumber],
              CAST(p.po_id AS VARCHAR(20)) AS [poLine],
              p.goods_no AS [itemCode],
              g.goods_name AS [material],
              p.su_name11 AS [supplier],
              CAST(p.sheet_qty AS FLOAT) AS [qty],
              p.unit_no AS [unit],
              CAST(p.sheet_pri AS FLOAT) AS [unitPrice],
              CAST(CASE WHEN p.check_sta = 'Y' THEN 1 ELSE 0 END AS BIT) AS [confirmed],
              p.del_date AS [eta],
              CAST(CASE WHEN EXISTS (
                SELECT 1 FROM pur_in2 i
                WHERE i.pur_no = p.sheet_no AND i.pur_id = p.po_sheet_id
                  AND i.goods_no = p.goods_no
              ) THEN 1 ELSE 0 END AS BIT) AS [arrived],
              (SELECT MAX(i.sheet_no) FROM pur_in2 i
               WHERE i.pur_no = p.sheet_no AND i.pur_id = p.po_sheet_id
                 AND i.goods_no = p.goods_no) AS [grnRef],
              CAST(COALESCE((
                SELECT SUM(a.allocated_qty) FROM whs_slot_allocation a WHERE a.po_id = p.po_id
              ), 0) AS FLOAT) AS [assignedQty]
            FROM PoRows p
            LEFT JOIN bas_goods g ON g.goods_no = p.goods_no
            ORDER BY p.po_id;
        `);
        return result.recordset;
    }
}

module.exports = new PORepository();
