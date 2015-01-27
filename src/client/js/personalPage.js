angular.module('personal-page', [])
.controller('personalPageCtrl', ["$scope", "$location", function($scope, $location) {
	console.log('/registry/view/member/'+$scope.security.currentUser.id);
	$location.path('/registry/view/member/'+$scope.security.currentUser.id);
}]);
