angular.module('personal-page', [])
.controller('personalPageCtrl', ["$scope", "$location", function($scope, $location) {
	console.log('/registry/view/uri~3A~2F~2Fregistries~2Fpeople~23views~2FpersonalProfile/'+$scope.security.currentUser.id);
	$location.path('/registry/view/uri~3A~2F~2Fregistries~2Fpeople~23views~2FpersonalProfile/'+$scope.security.currentUser.id);
}]);
