// Standardised JSON response helpers so every endpoint returns a consistent
// envelope: { success, message, data?, error?, timestamp }.

function ok(res, { data, message = "OK", status = 200, extra = {} } = {}) {
    return res.status(status).json({
        success: true,
        message,
        ...(data !== undefined ? { data } : {}),
        ...extra,
        timestamp: new Date().toISOString(),
    });
}

function fail(res, { message = "Request failed", status = 400, error } = {}) {
    return res.status(status).json({
        success: false,
        message,
        ...(error !== undefined ? { error } : {}),
        timestamp: new Date().toISOString(),
    });
}

module.exports = { ok, fail };
