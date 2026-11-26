const testProfiles = require("../config/testProfiles");

function opt(value) {
    return value === null || value === undefined ? undefined : value;
}

function toApiAccount(account) {
    const profile = !account.name && Object.hasOwn(testProfiles, account.id)
        ? testProfiles[account.id]
        : null;
    return {
        id: account.id,
        name: account.name ?? profile?.name ?? account.id,
        employeeCode: account.employeeCode,
        email: account.email ?? profile?.email ?? null,
        role: account.role,
        locked: account.locked,
    };
}

function toApiSlot(slot) {
    return {
        code: slot.code,
        warehouse: slot.warehouse,
        row: slot.row,
        floor: slot.floor,
        position: slot.position,
        keeperId: opt(slot.keeperId),
        locked: slot.locked,
        full: slot.full,
        active: slot.active,
    };
}

function toApiLot(lot) {
    const receiptLots = Array.isArray(lot.receiptLots) ? lot.receiptLots : [];
    // Gộp các receipt trùng mã lot trước khi xác định lotCode hiển thị.
    const distinctLotMap = new Map();
    for (const r of receiptLots) {
        if (!r.lotNo) continue;
        distinctLotMap.set(
            r.lotNo,
            (distinctLotMap.get(r.lotNo) || 0) + Number(r.receivedQty || 0)
        );
    }
    const distinctLots = [...distinctLotMap.entries()];
    const derivedLotCode =
        distinctLots.length === 1
            ? distinctLots[0][0]
            : distinctLots.length > 1
                ? ''
                : (lot.lotCode ?? '');
    return {
        id: lot.id,
        poNumber: lot.poNumber ?? '',
        poLine: lot.poLine ?? '',
        itemCode: lot.itemCode ?? '',
        material: lot.material ?? '',
        lotCode: derivedLotCode,
        supplier: lot.supplier ?? '',
        qty: lot.qty ?? 0,
        unit: lot.unit ?? '',
        receivedAt: lot.receivedAt ?? lot.assignedAt ?? '',
        shelfCode: opt(lot.shelfCode),
        assignedBy: opt(lot.allocatedByName ?? lot.assignedBy),
        assignedAt: opt(lot.assignedAt),
        status: lot.status,
        statusRecordedAt: lot.statusRecordedAt ?? (lot.status === 'WAITING_IQC' && !lot.iqcDecision ? lot.assignedAt : null) ?? null,
        waitingStockSince: ['WAITING_STOCK', 'SEND_STOCK'].includes(lot.status) ? (lot.statusRecordedAt ?? null) : null,
        iqcDecision: opt(lot.iqcDecision),
        hasWarning: opt(lot.hasWarning),
        qtyInStock: opt(lot.qtyInStock),
        ...(lot.status === 'IN_STOCK' && lot.qtyInStock != null ? {
            remainingStockQty: Number(lot.qtyInStock),
            reservedStockQty: Number(lot.outboundQuantities?.reserved_qty || 0),
        } : {}),
        qtyReturn: opt(lot.qtyReturn),
        iqcUpdatedAt: opt(lot.iqcUpdatedAt),
                closedAt: opt(lot.closedAt),
        receiptLots: distinctLots.map(([lotNo, receivedQty]) => ({
            lotNo,
            receivedQty: Number(receivedQty),
        })),
        source: 'mock',
    };
}

function toApiPo(po) {
    return {
        id: po.id,
        poNumber: po.poNumber,
        poLine: po.poLine,
        itemCode: po.itemCode,
        material: po.material,
        supplier: po.supplier,
        qty: po.qty,
                sheetQty: opt(po.sheetQty),
        unit: po.unit,
        unitPrice: po.unitPrice,
        confirmed: opt(po.confirmed),
        eta: po.eta,
        arrived: po.arrived,
        grnRef: opt(po.grnRef),
        lotNo: opt(po.lotNo),
        assignedQty: opt(po.assignedQty),
        source: 'mock',
    };
}

function toApiActivity(entry) {
    return {
        id: entry.id,
        time: entry.time,
        userId: entry.userId,
        actionKey: entry.actionKey,
        poNumber: opt(entry.poNumber),
        slotCode: opt(entry.slotCode),
        qty: opt(entry.qty),
        unit: opt(entry.unit),
        detail: opt(entry.detail),
    };
}

module.exports = { toApiAccount, toApiSlot, toApiLot, toApiPo, toApiActivity };
