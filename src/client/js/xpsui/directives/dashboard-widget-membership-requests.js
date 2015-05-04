(function(angular) {
	'use strict';

	function createWidgetBlock(title, content) {
		var block = angular.element('<div class="dashboard-widget-block">'
				+ '<div class="dashboard-widget-block-title">' + title + '<div>'
				+ '</div>');
		var contentDiv = angular.element('<div class="dashboard-widget-block-content"><div>');
		contentDiv.append(content);
		block.append(contentDiv);
		return block;
	}
	
	angular.module('xpsui:directives')
	.directive('xpsuiDashboardWidgetMembershipRequests', 
			['xpsui:logging', '$compile', '$translate', '$http', '$location', 'xpsui:SchemaUtil', 'xpsui:NotificationFactory',
			 'xpsui:NavigationService',
	        function(log, $compile, $translate, $http, $location, schemaUtilFactory, notificationFactory, navigationService) {
		return {
			controller: function($scope, $element, $attrs) {
			},
			link: function(scope, elm, attrs, ctrls) {
				scope.showRegistrations = function() {
					navigationService.navigateToPath(
							'/search/uri~3A~2F~2Fregistries~2Frequisitions~23views~2FrequisitionApplicant', 
							'search');
					$location.path('/search/uri~3A~2F~2Fregistries~2Frequisitions~23views~2FrequisitionApplicant');
				};

				log.group('xpsui-dashboard-widget-membership-requests Widget');

				elm.empty();

				elm.addClass('dashboard-widget-container');
				var title = $translate.instant('dashboard.widget.notifications.title');
				var titleBar = angular.element('<div class="dashboard-widget-title">' + title + '</div>');

				var content = angular.element(
					'<div class="dashboard-widget-content">'
					+ '</div>');
				var blocks = angular.element('<div class="dashboard-widget-blocks"></div>');
				content.append(blocks);

				var label_loading = $translate.instant('generic.loading');

				// registracie
				var contentBlock1Title = $translate.instant('dashboard.widget.members.openRequests');
				var contentBlock1Elm = angular.element('<div>' + label_loading + '</div>');
				var block1 = createWidgetBlock(contentBlock1Title, contentBlock1Elm)
				blocks.append(block1);

				var block2 = createWidgetBlock('Trasfery', 'Some content')
				blocks.append(block2);

				var block3 = createWidgetBlock('Example', 'Some content')
				blocks.append(block3);

				var block4 = createWidgetBlock('Example', 'Some content')
				blocks.append(block4);

				var block5 = createWidgetBlock('Example', 'Some content')
				blocks.append(block5);

				var block6 = createWidgetBlock('Example', 'Some content')
				blocks.append(block6);

				elm.append(titleBar);
				elm.append(content);

				$http({ method : 'POST',
					url: '/search/' + schemaUtilFactory.encodeUri('uri://registries/requisitions#views/peopleRegistrationApplicant/search')})
				.success(function(data, status, headers, config) {
					contentBlock1Elm.empty();
					if (data) {
						contentBlock1Elm.html(
								'<span>' + data.length + '</span><br/>'
								+ ' <a ng-click="showRegistrations()">' + $translate.instant('generic.more') + '</a>');
						$compile(contentBlock1Elm)(scope);
						return;
					}
					var label_noOpenRequests = $translate.instant('dashboard.widget.members.noOpenRequests');
					contentBlock1Elm.text(label_noOpenRequests);
				}).error(function(err) {
					notificationFactory.error(err);
				});

				log.groupEnd();
			}
		};
	}]);

}(window.angular));
