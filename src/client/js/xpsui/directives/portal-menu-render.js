(function(angular) {
	'use strict';
	
	angular.module('xpsui:directives')
	.directive('xpsuiPortalMenuRender', ['$http', '$route', '$compile', '$location', 
	function($http, $route, $compile, $location) {
		return {
			restrict: 'A',
			link: function(scope, elm, attrs, ctrls) {
				var loadingDiv = angular.element('<div>Nahrávam...</div>');

				elm.append(loadingDiv);

				var menuHash = [];
				var counter = 0;

				function renderMenuEntry(data, element) {
					var menuEntry = angular.element('<div class="portal-menu-entry"><a ng-click="navigate('+ (counter++) +');">'+data.name+'</a></div>');

					menuHash.push(data.tags);

					var subMenu = angular.element('<div class="portal-sub-menu"></div>');
					for (var i = 0; i < data.subElements.length; ++i) {
						subMenu.append(angular.element('<div ng-click="navigate('+ (counter++) +')">'+ data.subElements[i].name+'</div>'));
						menuHash.push(data.subElements[i].tags);
					}
					menuEntry.append(subMenu);
					return(menuEntry);

				}

				$http({
					method : 'GET',
					url: '/udao/list/portalMenu',
					data: {
					}
				})
				.success(function(data, status, headers, config){
					elm.empty();
					if (data && data.length > 0 && data[0].index) {
						for (var i = 0; i < data[0].index.subElements.length; ++i) {
							var menuEntry = renderMenuEntry(data[0].index.subElements[i]);
							elm.append(menuEntry);
							$compile(menuEntry)(scope);
						}
					}
				}).error(function(err) {
					notificationFactory.error(err);
				});

				scope.navigate = function(i) {
					$http({
						method : 'POST',
						url: '/portalapi/getByTags',
						data: {
							tags: menuHash[i]
						}
					})
					.success(function(data, status, headers, config){
						if (data && data.length > 0 && data[0].id) {
							$location.path('/portal/edit/'+ data[0].id);
							//$route.updateParams({id: data[0].id});
						}
					}).error(function(err) {
						notificationFactory.error(err);
					});
				};
			}
		};
	}]);
}(window.angular));