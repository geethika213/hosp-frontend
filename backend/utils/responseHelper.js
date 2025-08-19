// Standardized API response helper functions

const sendSuccessResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    if (data.pagination) {
      response.pagination = data.pagination;
      response.data = data.data || data;
    } else {
      response.data = data;
    }
  }

  return res.status(statusCode).json(response);
};

const sendErrorResponse = (res, statusCode = 500, message = 'Server Error', errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

const sendValidationError = (res, errors) => {
  return sendErrorResponse(res, 400, 'Validation failed', errors);
};

const sendNotFoundError = (res, resource = 'Resource') => {
  return sendErrorResponse(res, 404, `${resource} not found`);
};

const sendUnauthorizedError = (res, message = 'Access denied') => {
  return sendErrorResponse(res, 401, message);
};

const sendForbiddenError = (res, message = 'Forbidden') => {
  return sendErrorResponse(res, 403, message);
};

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
  sendValidationError,
  sendNotFoundError,
  sendUnauthorizedError,
  sendForbiddenError
};
