/**
 * Standard API response helpers.
 * Every response follows: { success, message, data? }
 */

const sendSuccess = (res, message = "Success", data = null, statusCode = 200) => {
    const payload = { success: true, message };
    if (data !== null && data !== undefined) {
        payload.data = data;
    }
    return res.status(statusCode).json(payload);
};

const sendError = (res, message = "Something went wrong", statusCode = 500, data = null) => {
    const payload = { success: false, message };
    if (data !== null && data !== undefined) {
        payload.data = data;
    }
    return res.status(statusCode).json(payload);
};

const sendCreated = (res, message = "Created successfully", data = null) => {
    return sendSuccess(res, message, data, 201);
};

const sendPaginated = (res, message = "Success", data, pagination) => {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination,
    });
};

module.exports = { sendSuccess, sendError, sendCreated, sendPaginated };
