(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:MassmailingFactory', [ '$http', function($http) {
		var service = {};
		service.sendMail = function(template,criteria,users) {

			return $http({
				method : 'POST',
				url : '/massmailing/send',
				data : {
					criteria : criteria,
					template: template,
					users: users
				}
			});
		};

		return service;
	} ]);

}(window.angular));