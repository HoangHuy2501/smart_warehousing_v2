const { randomUUID, timingSafeEqual } = require("node:crypto");
const jwt = require("jsonwebtoken");
const config = require("../config/env");
const AccountRepository = require("../repository/Account.repository");
const SlotRepository = require("../repository/Slot.repository");
const MaterialRepository = require("../repository/Material.repository");
const ApiError = require("../utils/ApiError");
const { toApiAccount, toApiSlot } = require("./warehouseMappers");

class AuthServices {
    constructor() {
        // Lưu các JWT đã đăng xuất theo jti đến khi token hết hạn.
        this.revoked = new Map();
    }

    verify(token) {
        if (!token) return null;

        try {
            const payload = jwt.verify(token, config.requireJwtSecret(), { algorithms: ["HS256"] });
            if (!payload.sub || !payload.jti || !payload.exp || this.revoked.has(payload.jti)) return null;
            return payload;
        } catch {
            return null;
        }
    }

    async login({ empNo, password }) {
        if (typeof empNo !== "string" || empNo.length > 20 ||
            !["string", "number"].includes(typeof password)) {
            throw ApiError.Unauthorized("invalid_credentials");
        }

        const [row] = await AccountRepository.findByEmployeeCode(empNo);
        if (!row?.active || row.locked || row.password == null) {
            throw ApiError.Unauthorized("invalid_credentials");
        }

        // T8/WHS đang lưu giá trị mật khẩu tương thích với backend cũ.
        const expected = Buffer.from(String(row.password));
        const supplied = Buffer.from(String(password));
        if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
            throw ApiError.Unauthorized("invalid_credentials");
        }

        const account = toApiAccount(row);
        const token = jwt.sign({
            empNo: account.employeeCode,
            role: account.role,
            name: account.name,
            email: account.email,
        }, config.requireJwtSecret(), {
            algorithm: "HS256",
            subject: account.id,
            jwtid: randomUUID(),
            expiresIn: config.warehouseTokenExpiry,
        });

        return { token, account };
    }

    logout({ jti, exp }) {
        const now = Date.now();
        for (const [id, expiresAt] of this.revoked) {
            if (expiresAt <= now) this.revoked.delete(id);
        }
        this.revoked.set(jti, exp * 1000);
        return { ok: true };
    }

    async me({ sub: employeeCode }) {
        const [row] = await AccountRepository.findByEmployeeCode(employeeCode);
        if (!row) throw ApiError.Unauthorized("unauthorized");

        const account = toApiAccount(row);
        if (account.role !== "KEEPER") return { account };

        const [shelves, managedMaterials] = await Promise.all([
            SlotRepository.listByKeeper(employeeCode),
            MaterialRepository.listByKeeper(employeeCode),
        ]);

        // Gom các kệ được phân công theo kho.
        const counts = new Map();
        for (const { warehouse } of shelves) {
            counts.set(warehouse, (counts.get(warehouse) ?? 0) + 1);
        }
        const managedWarehouses = Array.from(counts, ([warehouse, shelfCount]) => ({ warehouse, shelfCount }));

        return { account, shelves: shelves.map(toApiSlot), managedWarehouses, managedMaterials };
    }
}

module.exports = new AuthServices();
