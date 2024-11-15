function response(status, success, message, data = null) {
  return {
    status: status,
    success: success,
    message: message,
    data: data,
  };
}

export default response;
