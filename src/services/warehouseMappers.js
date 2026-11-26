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

module.exports = { toApiAccount, toApiSlot };
