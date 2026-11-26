const { getPool } = require("../config/connectData");

class LotRepository {
    async list() {
        const pool = await getPool();
        const request = pool.request();
        const result = await request.query(`
            SELECT
              a.id AS [id],
              COALESCE(o1.sheet_no, o2.sheet_no) AS [poNumber],
              CAST(a.po_id AS VARCHAR(20)) AS [poLine],
              a.goods_no AS [itemCode],
              g.goods_name AS [material],
              a.lot_no AS [lotCode],
              o1.su_name11 AS [supplier],
              CAST(a.allocated_qty AS FLOAT) AS [qty],
              o2.unit_no AS [unit],
              COALESCE(grn.received_at, o2.del_date) AS [receivedAt],
              a.slot_code AS [shelfCode],
              a.allocated_by_emp_no AS [assignedBy],
              a.allocated_at AS [assignedAt],
              a.status AS [status],
              a.status_recorded_at AS [statusRecordedAt],
              a.iqc_decision AS [iqcDecision],
              a.has_warning AS [hasWarning],
              CAST(a.qty_in_stock AS FLOAT) AS [qtyInStock],
              CAST(a.qty_return AS FLOAT) AS [qtyReturn],
              a.last_iqc_at AS [iqcUpdatedAt],
              a.closed_at AS [closedAt],
              e.emp_name AS [allocatedByName]
            FROM whs_slot_allocation a
            LEFT JOIN pur_order2 o2 ON o2.id = a.po_id
            LEFT JOIN pur_order1 o1 ON o1.sheet_no = o2.sheet_no
            LEFT JOIN bas_goods g ON g.goods_no = a.goods_no
            LEFT JOIN bas_emp e ON e.emp_no = a.allocated_by_emp_no
            LEFT JOIN (
              SELECT i2.pur_no, i2.pur_id, i2.goods_no,
                     MAX(i1.sheet_date) AS received_at
              FROM pur_in2 i2
              JOIN pur_order2 o2g
                ON o2g.sheet_no = i2.pur_no
               AND o2g.sheet_id = i2.pur_id
               AND o2g.goods_no = i2.goods_no
              LEFT JOIN pur_in1 i1 ON i1.sheet_no = i2.sheet_no
              -- Chỉ tổng hợp phiếu nhập của PO đã gán kệ.
              WHERE EXISTS (
                SELECT 1 FROM whs_slot_allocation ag
                WHERE ag.po_id = o2g.id AND ag.goods_no = i2.goods_no
              )
              GROUP BY i2.pur_no, i2.pur_id, i2.goods_no
            ) grn ON grn.pur_no = o1.sheet_no AND grn.pur_id = o2.sheet_id
             AND grn.goods_no = a.goods_no
            ORDER BY a.allocated_at, a.id;
        `);
        return result.recordset;
    }

    async listReceipts() {
        const pool = await getPool();
        const request = pool.request();
        const result = await request.query(`
            SELECT allocation_id AS allocationId, lot_no AS lotNo,
                   CAST(received_qty AS FLOAT) AS receivedQty
            FROM whs_allocation_receipt
            ORDER BY allocation_id, notice_detail_id;
        `);
        return result.recordset;
    }

    async listReservedQuantities() {
        const pool = await getPool();
        const request = pool.request();
        const result = await request.query(`
            SELECT p.allocation_id AS allocationId, SUM(p.planned_qty) AS reserved_qty
            FROM whs_outbound_pick p
            JOIN whs_outbound_line l ON l.scm_out_detail_id = p.scm_out_detail_id
            JOIN whs_slot_allocation a ON a.id = p.allocation_id
            WHERE l.completed_at IS NULL AND p.picked_at IS NULL AND a.status = 'IN_STOCK'
            GROUP BY p.allocation_id;
        `);
        return result.recordset;
    }
}

module.exports = new LotRepository();
