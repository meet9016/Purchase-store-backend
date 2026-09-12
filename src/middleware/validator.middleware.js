const ApiResponse = require('../utils/apiResponse');

// Email regex pattern for RFC 5322 standard
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Helper to sanitize & check strings
const isNonEmptyString = (val) => typeof val === 'string' && val.trim().length > 0;
const isValidNumber = (val) => typeof val === 'number' && !isNaN(val) && val > 0;

/**
 * Auth Validations
 */
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !isNonEmptyString(email)) {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Please provide a valid email address');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return ApiResponse.badRequest(res, errors.join('. '));
  }

  next();
};

exports.validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || !isNonEmptyString(name)) {
    errors.push('Full Name is required');
  }

  if (!email || !isNonEmptyString(email)) {
    errors.push('Email address is required');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Please enter a valid email address');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!role || !isNonEmptyString(role)) {
    errors.push('User role is required');
  }

  if (errors.length > 0) {
    return ApiResponse.badRequest(res, errors.join('. '));
  }

  next();
};

exports.validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const errors = [];

  if (!currentPassword || !isNonEmptyString(currentPassword)) {
    errors.push('Current password is required');
  }

  if (!newPassword || typeof newPassword !== 'string') {
    errors.push('New password is required');
  } else if (newPassword.length < 6) {
    errors.push('New password must be at least 6 characters long');
  }

  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.push('New password must be different from current password');
  }

  if (errors.length > 0) {
    return ApiResponse.badRequest(res, errors.join('. '));
  }

  next();
};

/**
 * Purchase Domain Validations
 */
exports.validatePR = (req, res, next) => {
  const { projectId, items } = req.body;
  const errors = [];

  if (!projectId || !isNonEmptyString(projectId)) {
    errors.push('Project selection is required');
  }

  if (!Array.isArray(items) || items.length === 0) {
    errors.push('At least one line item is required');
  } else {
    items.forEach((item, index) => {
      if (!item.itemId) errors.push(`Item #${index + 1}: Item selection is required`);
      if (!item.quantity || item.quantity <= 0) errors.push(`Item #${index + 1}: Quantity must be greater than 0`);
    });
  }

  if (errors.length > 0) {
    return ApiResponse.badRequest(res, errors.join('. '));
  }

  next();
};

exports.validatePO = (req, res, next) => {
  const { vendorId, items } = req.body;
  const errors = [];

  if (!vendorId || !isNonEmptyString(vendorId)) {
    errors.push('Vendor selection is required');
  }

  if (!Array.isArray(items) || items.length === 0) {
    errors.push('At least one item is required in the Purchase Order');
  } else {
    items.forEach((item, index) => {
      if (!item.itemId) errors.push(`Item #${index + 1}: Item selection is required`);
      if (!item.quantity || item.quantity <= 0) errors.push(`Item #${index + 1}: Quantity must be greater than 0`);
    });
  }

  if (errors.length > 0) {
    return ApiResponse.badRequest(res, errors.join('. '));
  }

  next();
};

exports.validateGRN = (req, res, next) => {
  const { poId, items } = req.body;
  const errors = [];

  if (!poId || !isNonEmptyString(poId)) {
    errors.push('PO Reference is required');
  }

  if (!Array.isArray(items) || items.length === 0) {
    errors.push('At least one received item is required');
  }

  if (errors.length > 0) {
    return ApiResponse.badRequest(res, errors.join('. '));
  }

  next();
};

/**
 * Store & Stock Validations
 */
exports.validateStoreOutward = (req, res, next) => {
  const { issuedTo, items } = req.body;
  const errors = [];

  if (!issuedTo || !isNonEmptyString(issuedTo)) {
    errors.push('Receiver name (Issued To) is required');
  }

  if (!Array.isArray(items) || items.length === 0) {
    errors.push('At least one issue item is required');
  } else {
    items.forEach((item, index) => {
      if (!item.itemId) errors.push(`Item #${index + 1}: Item selection is required`);
      if (!item.quantity || item.quantity <= 0) errors.push(`Item #${index + 1}: Quantity must be greater than 0`);
    });
  }

  if (errors.length > 0) {
    return ApiResponse.badRequest(res, errors.join('. '));
  }

  next();
};

/**
 * Finance Domain Validations
 */
exports.validateVendorBill = (req, res, next) => {
  const { billAmount, vendorName, poNumber } = req.body;
  const errors = [];

  if (!billAmount || Number(billAmount) <= 0) {
    errors.push('Bill amount must be greater than 0');
  }

  if (errors.length > 0) {
    return ApiResponse.badRequest(res, errors.join('. '));
  }

  next();
};

exports.validatePaymentRequest = (req, res, next) => {
  const { billId, requestedAmount } = req.body;
  const errors = [];

  if (!billId || !isNonEmptyString(billId)) {
    errors.push('Vendor Bill reference is required');
  }

  if (!requestedAmount || Number(requestedAmount) <= 0) {
    errors.push('Requested amount must be greater than 0');
  }

  if (errors.length > 0) {
    return ApiResponse.badRequest(res, errors.join('. '));
  }

  next();
};

exports.validatePaymentEntry = (req, res, next) => {
  const { billId, paymentAmount, paymentMode } = req.body;
  const errors = [];

  if (!billId || !isNonEmptyString(billId)) {
    errors.push('Bill reference is required');
  }

  if (!paymentAmount || Number(paymentAmount) <= 0) {
    errors.push('Payment amount must be greater than 0');
  }

  if (!paymentMode || !isNonEmptyString(paymentMode)) {
    errors.push('Payment mode (Bank Transfer / Cheque / NEFT / RTGS) is required');
  }

  if (errors.length > 0) {
    return ApiResponse.badRequest(res, errors.join('. '));
  }

  next();
};
