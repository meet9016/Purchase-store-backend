/**
 * Standard API Response Structure:
 * { "status": <200|400|404|500>, "message": "<string>", "data": <array|object>, "pagination": <object|optional> }
 */

class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200, pagination = null) {
    const responsePayload = {
      status: statusCode,
      message,
      data,
    };

    if (pagination) {
      responsePayload.pagination = pagination;
    }

    return res.status(statusCode).json(responsePayload);
  }

  static created(res, data = null, message = 'Resource created successfully') {
    return ApiResponse.success(res, data, message, 201);
  }

  static error(res, message = 'An error occurred', statusCode = 500, errors = null) {
    const responsePayload = {
      status: statusCode,
      message,
      data: null,
    };

    if (errors) {
      responsePayload.errors = errors;
    }

    return res.status(statusCode).json(responsePayload);
  }

  static badRequest(res, message = 'Bad Request', errors = null) {
    return ApiResponse.error(res, message, 400, errors);
  }

  static unauthorized(res, message = 'Unauthorized access') {
    return ApiResponse.error(res, message, 401);
  }

  static forbidden(res, message = 'Forbidden: Insufficient permissions') {
    return ApiResponse.error(res, message, 403);
  }

  static notFound(res, message = 'Resource not found') {
    return ApiResponse.error(res, message, 404);
  }
}

module.exports = ApiResponse;
