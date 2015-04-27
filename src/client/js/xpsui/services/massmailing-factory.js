(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:MassmailingFactory', [ '$http', function($http) {
		var service = {};
		service.sendMail = function(template,crits,users) {

			return $http({
				method : 'POST',
				url : '/massmailing/send',
				data : {
					crits : crits,
					template: template,
					users: users
				}
			});
		};

		return service;
	} ]);

}(window.angular));
