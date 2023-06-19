export const resourceNotFound = (res): void => {
  res.status(404).json({ success: false, message: 'Resource not found' });
};

export const invalidRequest = (res, details?: string): void => {
  res.status(400).json({ success: false, message: 'Invalid request', details });
};

export const forbidden = (res): void => {
  res.status(403).json({ success: false, message: 'Access denied' });
};

export const internalError = (res): void => {
  res.status(500).json({ success: false, message: 'Internal server error' });
};
