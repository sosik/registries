angular.module('psui-objectlink', [])
.directive('psuiObjectlink', ['$compile', '$parse', '$http', function($compile, $parse, $http) {
	return {
		restrict: 'E',
		require: ['^ngModel', '^form'],
		link: function(scope, elm, attrs, ctrls) {
			var schemaFragment = null;

			if (attrs.schemaFragment) {
				schemaFragment = ($parse(attrs.schemaFragment))(scope);
			}
			var ngModel = ctrls[0];

			ngModel.$render = function() {
				if (ngModel.$viewValue) {
					if (ngModel.$viewValue.refData) {
						var displayText = '';
						for (var i in ngModel.$viewValue.refData) {
							if (typeof ngModel.$viewValue.refData[i] === 'string') {
								displayText = ngModel.$viewValue.refData[i] + ' ';
							}
						}

						elm.text(displayText);
					}
				} else {
					elm.text('');
				}
			};
			
			var wrapper;
			
			// create base html elements
			if (elm.parent().hasClass('psui-wrapper')) {
				// element is wrapped, we are going to use this wrapper
				wrapper = elm.parent();
			} else {
				// there is no wrapper, we have to create one
				wrapper = angular.element('<span class="psui-wrapper"></span>');
				elm.wrap(wrapper);
			}

			elm.addClass('psui-datepicker');
			elm.addClass('form-control');
			var buttonsHolder = angular.element('<div class="psui-buttons-holder"></div>');
			wrapper.append(buttonsHolder);
			var buttonShowDropdown = angular.element('<button class="btn psui-icon-chevron-down"></button>');
			buttonShowDropdown.attr('tabindex', '-1');
			buttonsHolder.append(buttonShowDropdown);


			var dropdownHolder = angular.element('<div class="psui-objectlink-dropdown" style="width:100%;"></div>');
			wrapper.append(dropdownHolder);
			dropdownHolder.addClass('psui-dropdown');
			dropdownHolder.addClass('psui-datepicker-dropdown');

			var queryField = angular.element('<input style="width:100%;"></input>');
			dropdownHolder.append(queryField);

			var searchResultHolder = angular.element('<div></div>');

			dropdownHolder.addClass('psui-hidden');

			var dropdown = angular.element('<div></div>');
			dropdownHolder.append(dropdown);

			buttonShowDropdown.on('click', function() {
				dropdownHolder.toggleClass('psui-hidden');
			});

			var doSearch = function() {
				if (schemaFragment) {
					var qfName = null;
					for (var f in schemaFragment.$objectLink){
						if (f === 'registry') {
							continue;
						} else {
							qfName = schemaFragment.$objectLink[f];
							break;
						}
					}
					$http({ method : 'POST',url: '/udao/search/'+schemaFragment.$objectLink.registry, data: {criteria:[{op:'starts', v: queryField.val(), f: qfName}]} })
					.success(function(data, status, headers, config){
						console.log(data);
						dropdown.empty();
						for (var i = 0; i < data.length; ++i) {
							var rData = {
								registry: schemaFragment.$objectLink.registry,
								oid: data[i].id,
								refData: {}
							};

							var e = angular.element('<div></div>');
							for (var field in schemaFragment.$objectLink) {
								if (field != 'registry') {
									var dataField = schemaFragment.$objectLink[field];

									var getter = $parse(dataField);
									var setter = $parse(field);
									var sData = {};
									//setter.assign(rData.refData, getter(data[i]));
									setter.assign(sData, getter(data[i]));
									angular.extend(rData.refData, sData);
								}
							}

							var displayText = 'xx';
							for (var j in rData.refData) {
								displayText = rData.refData[j] + ' ';
							}

							e.text(displayText);
							e.data('data', rData);
							e.addClass('action-current-day');

							e.on('click', function(evt) {
								ngModel.$setViewValue(e.data('data'));
								ngModel.$render();
								scope.$emit('psui:model_changed');
								dropdownHolder.addClass('psui-hidden');
							});
							dropdown.append(e);

							console.log(rData);
						}
					}).error(function(err) {
					});
				}
			}
			queryField.on('keyup', function(evt) {
					doSearch();
			});
		}
	};
}]);
