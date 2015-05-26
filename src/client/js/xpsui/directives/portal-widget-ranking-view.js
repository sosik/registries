(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetRankingView', ['xpsui:logging', '$compile', function(log, $compile) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetRankingView',
				index: '='
			},
			link: function(scope, elm, attrs, ctrls) {
				log.group('portal-widget-file-list-view Link');

				elm.empty();
				elm.addClass('x-portal-widget-edit');
				elm.addClass('portal-article-ranking');


				var content = angular.element('<div class="portal-content-title"></div>' +
						'<div style="padding-left: 2px;" class="ranking">' +
						'<div class="portal-content-actual-ranking">' +
						'<div ng-repeat="result in data.data.results" class="actual-ranking-riders-items">' +
								'<div class="rider-name">{{$index+1}}. {{result.name}}</div>' +
								'<div class="rider-country">({{result.country}})</div>' +
								'<div class="rider-points">({{result.points}})</div>' +
								'<div class="rider-graph" style=" width: {{result.percent}}%; "></div>' +
						'</div>' +
					'</div></div>');

				elm.append(content);

				$compile(content)(scope);

				log.groupEnd();
			}
		};
	}]);

}(window.angular));
