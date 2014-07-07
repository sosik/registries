angular.module('psui-objectlink', [])
.directive('psuiObjectlinkView', ['$parse', function($parse) {
	return {
		restrict: 'A',
		require: ['^ngModel'],
		link: function(scope, elm, attrs, ctrls) {
			var schemaFragment = null;

			if (attrs.schemaFragment) {
				schemaFragment = $parse(attrs.schemaFragment);
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
					} else {
						elm.text('');
					}
				} else {
					elm.text('');
				}
			};
		}
	};
}])
.directive('psuiObjectlink', ['$compile', '$parse', '$http', function($compile, $parse, $http) {
	return {
		restrict: 'E',
		require: ['^ngModel'],
		link: function(scope, elm, attrs, ctrls) {
			var schemaFragment = null;

			if (attrs.schemaFragment) {
				schemaFragment = $parse(attrs.schemaFragment);
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
					} else {
						elm.text('');
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

			var dropdownHolder = angular.element('<div class="psui-objectlink-dropdown" style="width:100%;"></div>');
			wrapper.append(dropdownHolder);
			dropdownHolder.addClass('psui-dropdown');

            var buttonsHolder = angular.element('<div class="psui-buttons-holder"></div>');
			wrapper.append(buttonsHolder);
			var buttonShowDropdown = angular.element('<button class="btn psui-icon-chevron-down"></button>');
			buttonShowDropdown.attr('tabindex', '-1');
			buttonsHolder.append(buttonShowDropdown);

			var queryField = angular.element('<input class="form-control"></input>');
			dropdownHolder.append(queryField);
            
            queryField.wrap( "<header></header>" );

			var searchResultHolder = angular.element('<div></div>');

			dropdownHolder.addClass('psui-hidden');

			var dropdown = angular.element('<section></section>');
			dropdownHolder.append(dropdown);
//            dropdown.addClass('psui-objectlink-list');

			buttonShowDropdown.on('click', function() {
				dropdownHolder.toggleClass('psui-hidden');
			});

			var doSearch = function() {
				if (schemaFragment(scope)) {
					var qfName = null;
					for (var f in schemaFragment(scope).$objectLink){
						if (f === 'registry') {
							continue;
						} else {
							qfName = schemaFragment(scope).$objectLink[f];
							break;
						}
					}
					$http({ method : 'POST',url: '/udao/search/'+schemaFragment(scope).$objectLink.registry, data: {criteria:[{op:'starts', v: queryField.val(), f: qfName}]} })
					.success(function(data, status, headers, config){
						console.log(data);
						dropdown.empty();
						for (var i = 0; i < data.length; ++i) {
							var rData = {
								registry: schemaFragment(scope).$objectLink.registry,
								oid: data[i].id,
								refData: {}
							};

							var e = angular.element('<div></div>');
							for (var field in schemaFragment(scope).$objectLink) {
								if (field != 'registry') {
									var dataField = schemaFragment(scope).$objectLink[field];

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

							e.on('click', function(evt) {
								ngModel.$setViewValue(angular.element(evt.target).data('data'));
								ngModel.$render();
								//scope.$emit('psui:model_changed');
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
