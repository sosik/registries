(function(angular) {
	'use strict';

	angular.module('xpsui:filters')
	.filter('dateToString', function() {
		return function(value) {
			if (value) {
				var year = value.substring(0,4);
				var month = value.substring(4,6);
				var day = value.substring(6,8);
				if (year.length === 4 && month.length === 2 && day.length === 2) {
					var d = new Date(year, month-1, day);

					return d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear();
				}

				return value;
			}
			return '';
		};
	});

}(window.angular));
