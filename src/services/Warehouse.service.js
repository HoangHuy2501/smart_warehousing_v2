const AccountRepository = require("../repository/Account.repository");
const SlotRepository = require("../repository/Slot.repository");
const LotRepository = require("../repository/Lot.repository");
const PORepository = require("../repository/PO.repository");
const ActivityRepository = require("../repository/Activity.repository");
const { toApiAccount, toApiSlot, toApiLot, toApiPo, toApiActivity } = require("./warehouseMappers");

class WarehouseServices {
    async getBootstrap() {
        const [accounts, slots, lots, incomingPos, activity] = await Promise.all([
            AccountRepository.list(),
            SlotRepository.list(),
            this.listLots(),
            PORepository.listIncoming(),
            ActivityRepository.listRecent(200),
        ]);

        return {
            accounts: accounts.sort((a, b) => a.id.localeCompare(b.id)).map(toApiAccount),
            slots: slots.map(toApiSlot),
            lots,
            incomingPos: incomingPos.sort((a, b) => Number(a.id) - Number(b.id) || a.id.localeCompare(b.id)).map(toApiPo),
            activity: activity.map(toApiActivity),
        };
    }

    async listLots() {
        const lots = await LotRepository.list();
        if (lots.length === 0) return [];

        const includeReserved = process.env.OUTBOUND_SYNC_START_DATE &&
            lots.some((lot) => lot.status === "IN_STOCK");
        const [receipts, reserved] = await Promise.all([
            LotRepository.listReceipts(),
            includeReserved ? LotRepository.listReservedQuantities() : [],
        ]);

        // Ghép receipt và số lượng đã giữ theo ID lần gán kệ.
        const byAllocation = new Map();
        for (const receipt of receipts) {
            const list = byAllocation.get(receipt.allocationId) ?? [];
            list.push(receipt);
            byAllocation.set(receipt.allocationId, list);
        }
        const outbound = new Map(reserved.map((row) => [row.allocationId, row]));

        return lots.sort((a, b) =>
            String(b.assignedAt || "").localeCompare(String(a.assignedAt || "")) ||
            String(b.id).localeCompare(String(a.id))
        ).map((lot) => toApiLot({
            ...lot,
            receiptLots: byAllocation.get(lot.id),
            outboundQuantities: outbound.get(lot.id),
        }));
    }
}

module.exports = new WarehouseServices();
