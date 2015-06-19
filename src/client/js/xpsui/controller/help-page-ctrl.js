(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller('xpsui:HelpPageCtrl', [
		"$scope", 
		"$location", 
		function($scope, $location) {
			$scope.greeting = 'Help';
			console.log($scope.greeting);
		}
	]);
}(window.angular));