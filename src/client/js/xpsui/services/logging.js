(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.provider('xpsui:logging', [function() {
		var level = 7;

		function Logger(loggingLevel) {
			this.level = loggingLevel;
			this.ERROR = 1;
			this.WARN = 2;
			this.INFO = 3;
			this.DEBUG = 4;
			this.TRACE = 5;
		}

		Logger.prototype.info = function() {
			if (this.level >= this.INFO) {
				console.info.apply(console, arguments);
			}
		};
		Logger.prototype.debug = function() {
			if (this.level >= this.DEBUG) {
				console.debug.apply(console, arguments);
			}
		};

		Logger.prototype.trace = function() {
			if (this.level >= this.TRACE) {
				console.trace.apply(console, arguments);
			}
		};

		Logger.prototype.warn = function() {
			if (this.level >= this.WARN) {
				console.warn.apply(console, arguments);
			}
		};

		Logger.prototype.error = function() {
			if (this.level >= this.ERROR) {
				console.error.apply(console, arguments);
			}
		};

		Logger.prototype.group = function() {
			if (this.level >= this.INFO) {
				console.groupCollapsed.apply(console, arguments);
			}
		};

		Logger.prototype.groupEnd = function() {
			if (this.level >= this.INFO) {
				console.groupEnd.apply(console, arguments);
			}
		};

		Logger.prototype.profile = function() {
			if (this.level >= this.INFO) {
				console.profile.apply(console, arguments);
			}
		};

		Logger.prototype.profileEnd = function() {
			if (this.level >= this.INFO) {
				console.profileEnd.apply(console, arguments);
			}
		};

		Logger.prototype.time = function() {
			if (this.level >= this.INFO) {
				console.time.apply(console, arguments);
			}
		};

		Logger.prototype.timeEnd = function() {
			if (this.level >= this.INFO) {
				console.timeEnd.apply(console, arguments);
			}
		};

		var loggerSingleton = new Logger(level);

		return {
			setLevel: function(l) {
				level = l;
			},
		   $get: function() {
			   return loggerSingleton;
		   }
		};
	}]);

}(window.angular));
