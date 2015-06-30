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
	.directive('xpsuiDashboardWidgetRequests', 
			['xpsui:logging', '$compile', '$translate', '$http', '$location', 'xpsui:SchemaUtil', 'xpsui:NotificationFactory',
			 'xpsui:NavigationService',
	        function(log, $compile, $translate, $http, $location, schemaUtilFactory, notificationFactory, navigationService) {
		return {
			controller: function($scope, $element, $attrs) {
			},
			link: function(scope, elm, attrs, ctrls) {
				scope.showRegistrations = function() {
					navigationService.navigateToPath(
							'/registry/search/uri~3A~2F~2Fregistries~2FregistrationRequests~23views~2FpeopleRegistrationApplicant~2Fsearch', 
							'search');
					$location.path('/registry/search/uri~3A~2F~2Fregistries~2FregistrationRequests~23views~2FpeopleRegistrationApplicant~2Fsearch');
				};

				scope.showDataChanges = function() {
					navigationService.navigateToPath(
							'/registry/search/uri~3A~2F~2Fregistries~2FdataChangeRequests~23views~2FdataChangeApplicant~2Fsearch',
							'search');
					$location.path('/registry/search/uri~3A~2F~2Fregistries~2FdataChangeRequests~23views~2FdataChangeApplicant~2Fsearch');
				}

				scope.showTransfers = function() {
					navigationService.navigateToPath(
							'/registry/search/uri~3A~2F~2Fregistries~2FtransferRequests~23views~2FtransferApplicant~2Fsearch',
							'search');
					$location.path('/registry/search/uri~3A~2F~2Fregistries~2FtransferRequests~23views~2FtransferApplicant~2Fsearch');
				}

				scope.showRegistrationsSolver = function(){
					navigationService.navigateToPath(
							'/registry/search/uri~3A~2F~2Fregistries~2FregistrationRequests~23views~2FpeopleRegistrationSolver~2Fsearch', 
							'search');
					$location.path('/registry/search/uri~3A~2F~2Fregistries~2FregistrationRequests~23views~2FpeopleRegistrationSolver~2Fsearch');
				}

				scope.showDataChangesSolver = function(){
					navigationService.navigateToPath(
							'/registry/search/uri~3A~2F~2Fregistries~2FdataChangeRequests~23views~2FdataChangeSolver~2Fsearch', 
							'search');
					$location.path('/registry/search/uri~3A~2F~2Fregistries~2FdataChangeRequests~23views~2FdataChangeSolver~2Fsearch');
				}

				scope.showTransfersSolver = function(){
					navigationService.navigateToPath(
							'/registry/search/uri~3A~2F~2Fregistries~2FtransferRequests~23views~2FtransferSolver~2Fsearch', 
							'search');
					$location.path('/registry/search/uri~3A~2F~2Fregistries~2FtransferRequests~23views~2FtransferSolver~2Fsearch');
				}
				
				// Gets the number of results for a search query specified by the URI.
				var getCount = function (uri, block, onClick){
					$http({ method : 'POST',
						url: '/search/' + schemaUtilFactory.encodeUri(uri)})
					.success(function(data, status, headers, config) {
						block.empty();
						if (data) {
							block.html(
									'<span>' + data.length + '</span><br/>'
									+ ' <a ng-click=" ' + onClick + ' ">' + $translate.instant('generic.more') + '</a>');
							$compile(block)(scope);
							return;
						}
						var label_noOpenRequests = $translate.instant('dashboard.widget.members.noOpenRequests');
						block.text(label_noOpenRequests);
					}).error(function(err) {
						notificationFactory.error(err);
					});		
				}

				log.group('xpsui-dashboard-widget-requests Widget');

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

				var contentBlock1Elm = angular.element('<div>' + label_loading + '</div>');
				var contentBlock2Elm = angular.element('<div>' + label_loading + '</div>');
				var contentBlock3Elm = angular.element('<div>' + label_loading + '</div>');
				
				//If the user can solve requests, the request solver search results are used
				if (scope.hasPermissions(['Registry - read'])){
					var contentBlock1Title = $translate.instant('dashboard.widget.members.openRequests');
					var contentBlock2Title = $translate.instant('dashboard.widget.data.openRequests');
					var contentBlock3Title = $translate.instant('dashboard.widget.transfer.openRequests');

					getCount('uri://registries/registrationRequests#views/peopleRegistrationSolver/search', contentBlock1Elm, 'showRegistrationsSolver()');
					getCount('uri://registries/dataChangeRequests#views/dataChangeSolver/search', contentBlock2Elm, 'showDataChangesSolver()');
					getCount('uri://registries/transferRequests#views/transferSolver/search', contentBlock3Elm, 'showTransfersSolver()');
				} 
				// If the user can only create requests, the request applicant search results are used
				else if (scope.hasPermissions(['Registry Requests'])){
					var contentBlock1Title = $translate.instant('dashboard.widget.members.openRequests');
					var contentBlock2Title = $translate.instant('dashboard.widget.data.openRequests');
					var contentBlock3Title = $translate.instant('dashboard.widget.transfer.openRequests');

					getCount('uri://registries/registrationRequests#views/peopleRegistrationApplicant/search', contentBlock1Elm, 'showRegistrations()');
					getCount('uri://registries/dataChangeRequests#views/dataChangeApplicant/search', contentBlock2Elm,'showDataChanges()');
					getCount('uri://registries/transferRequests#views/transferApplicant/search', contentBlock3Elm, 'showTransfers()');
				} 

				var block1 = createWidgetBlock(contentBlock1Title, contentBlock1Elm)
				blocks.append(block1);

				var block2 = createWidgetBlock(contentBlock2Title, contentBlock2Elm)
				blocks.append(block2);

				var block3 = createWidgetBlock(contentBlock3Title, contentBlock3Elm)
				blocks.append(block3);

				elm.append(titleBar);
				elm.append(content);

				log.groupEnd();
			}
		};
	}]);

}(window.angular));
