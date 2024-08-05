class BaseError extends Error {
	constructor(message) {
		super(message);
		this.statusCode = 500;
	}
}

class ValidationError extends BaseError {
	constructor(message) {
		super(message);
		this.statusCode = 400;
	}
}

class NotFoundError extends BaseError {
	constructor(message) {
		super(message);
		this.statusCode = 404;
	}
}

module.exports = {
	ValidationError,
	NotFoundError,
};