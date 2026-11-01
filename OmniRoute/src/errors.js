export class HttpError extends Error {
  constructor(status, message, type = "invalid_request_error") {
    super(message);
    this.status = status;
    this.type = type;
  }
}

export function errorPayload(message, type = "server_error") {
  return { error: { message, type } };
}
