var RequestLogger = function(logger) {
	var _logger = logger;

	this.logger = function() {

		return function(rq, rs, next) {
		var startTime = process.hrtime();
		var startDate = (new Date()).toISOString();

		var log = function() {
			rs.removeListener('finish', log);
			rs.removeListener('close', log);

			var stopTime = process.hrtime(startTime);
			_logger.info(startDate, rq.originalUrl, rs.statusCode, (stopTime[0]*1e9 + stopTime[1])/1e9);
		};

			rs.on('finish', log);
			rs.on('close', log);
			next();
		};
	};
}

module.exports = {
	/**
	 * get instance of logger
	 * @param logger logger to write messages into
	 */
	getLogger: function(logger) {
		return new RequestLogger(logger);
	}
};

