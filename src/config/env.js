const jwtSecret = process.env.JWT_SECRET?.trim();

function requireJwtSecret() {
    if (!jwtSecret) throw new Error("JWT_SECRET is required");
    return jwtSecret;
}

module.exports = {
    jwtSecret,
    requireJwtSecret,
    warehouseTokenExpiry: "365d",
};
