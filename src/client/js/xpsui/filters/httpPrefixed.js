(function(angular) {
	'use strict';

	angular.module('xpsui:filters')
	.filter('httpPrefixed', function() {
		return function(value) {
			if (value && 
					(value.toLowerCase().startsWith('http://') || value.toLowerCase().startsWith('https://'))) {
				return value;
			}

			return 'http://' + value;
		};
	});

}(window.angular));
