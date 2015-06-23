(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller('xpsui:HelpPageCtrl', [
		"$scope", 
		function($scope) {
			$scope.greeting = 'Help';
			console.log($scope.greeting);
		}
	]);
}(window.angular));