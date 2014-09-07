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
						var count = 0;
						for (var i in ngModel.$viewValue.refData) {
							if (typeof ngModel.$viewValue.refData[i] === 'string') {
								++count;
							}
						}
						for (var i in ngModel.$viewValue.refData) {
							if (typeof ngModel.$viewValue.refData[i] === 'string') {
								displayText += '<td style="width: '+100/count+'%;">' + ngModel.$viewValue.refData[i] + '</td>';
							}
						}

						elm.html('<table style="width:100%; table-layout: fixed;"><tr>' + displayText + '</tr></table>');
					} else {
						elm.html('&nbsp;');
					}
				} else {
					elm.html('&nbsp;');
				}
			};
		}
	};
}])
.directive('psuiObjectlink', ['psui.dropdownFactory', '$compile', '$parse', '$http', function(dropdownFactory, $compile, $parse, $http) {
	return {
		restrict: 'E',
		require: ['^ngModel', '^?psuiFormCtrl'],
		link: function(scope, elm, attrs, ctrls) {
			var dataArray = new Array();
			var schemaFragment = null;

			if (attrs.schemaFragment) {
				schemaFragment = $parse(attrs.schemaFragment);
			}
			var ngModel = ctrls[0];

			ngModel.$render = function() {
				if (ngModel.$viewValue) {
					if (ngModel.$viewValue.refData) {
						var displayText = '';
						var count = 0;
						for (var i in ngModel.$viewValue.refData) {
							if (typeof ngModel.$viewValue.refData[i] === 'string') {
								++count;
							}
						}
						for (var i in ngModel.$viewValue.refData) {
							if (typeof ngModel.$viewValue.refData[i] === 'string') {
								displayText += '<td style="width: '+100/count+'%;">' + ngModel.$viewValue.refData[i] + '</td>';
							}
						}

						elm.html('<table style="width:100%; table-layout: fixed;"><tr>' + displayText + '</tr></table>');
					} else {
						elm.html('&nbsp;');
					}
				} else {
					elm.html('&nbsp;');
				}
/*				if (ngModel.$viewValue) {
					if (ngModel.$viewValue.refData) {
						var displayText = '';
						for (var i in ngModel.$viewValue.refData) {
							if (typeof ngModel.$viewValue.refData[i] === 'string') {
								displayText += ngModel.$viewValue.refData[i] + ' ';
							}
						}

						elm.text(displayText);
					} else {
						elm.text('');
					}
				} else {
					elm.text('');
				}
*/			};

			// custom require validation
			var validateRequire = function(val) {
				if (val && val.registry && val.registry.length && val.registry.length > 0 && val.oid && val.oid.length && val.oid.length > 0) {
					ngModel.$setValidity('required', true);
					console.log('valid');
				} else {
					ngModel.$setValidity('required', false);
					console.log('invalid');
				}

				return val;
			};

			if (attrs.xpsuiRequired) {
				ngModel.$parsers.unshift(validateRequire);
				ngModel.$formatters.unshift(validateRequire);
			}

			ngModel.$isEmpty = function(val) {
				if (val && val.registry && val.registry.length && val.registry.length > 0 && val.oid && val.oid.length && val.oid.length > 0) {
					console.log('not empty');
					return false;
				}

					console.log('empty');
				return true;
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
			
			if (!attrs.tabindex) {
				attrs.$set('tabindex', 0);
			}
			
			elm.addClass('psui-selectbox');
			elm.addClass('form-control');
			
            var buttonsHolder = angular.element('<div class="psui-buttons-holder"></div>');
			wrapper.append(buttonsHolder);
			var buttonShowDropdown = angular.element('<button type="button" class="btn psui-icon-chevron-down"></button>');
			buttonShowDropdown.attr('tabindex', '-1');
			buttonsHolder.append(buttonShowDropdown);

			
			var dataArray = new Array();
			
			var doSearch = function(callback) {
				dataArray = [];
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

					var crits = [];

					crits.push({op:'contains', v: dropdown.searchInputValue(), f: qfName});

					if (schemaFragment(scope).$objectLinkForcedCriteria) {
						crits = crits.concat(schemaFragment(scope).$objectLinkForcedCriteria);
					}
					$http({ method : 'POST',url: '/udao/search/'+schemaFragment(scope).$objectLink.registry, data: {criteria: crits, limit: 20, skip:0, sortBy:[{f:qfName, o:'asc'}]} })
					.success(function(data, status, headers, config){
						//console.log('blabla' + data);
						for (var i = 0; i < data.length; ++i) {
							var rData = {
								registry: schemaFragment(scope).$objectLink.registry,
								oid: data[i].id,
								refData: {}
							};

							//var e = angular.element('<div></div>');
							for (var field in schemaFragment(scope).$objectLink) {
								if (field != 'registry') {
									var dataField = schemaFragment(scope).$objectLink[field];

									var getter = $parse(dataField);
									var setter = $parse(field);
									var sData = {};
									//setter.assign(rData.refData, getter(data[i]));
									setter.assign(sData, getter(data[i]));
									if (typeof sData[field] === 'undefined') {
										sData[field] = '';
									}
									angular.extend(rData.refData, sData);
								}
							}
							dataArray.push(rData);
							//dataArray[i]=[];
							/*for (j in rData.refData) {
								
								if (typeof rData.refData[j] === 'string') {
									//displayText += '<td style="width: '+100/count+'%;">' + rData.refData[j] + '</td>';
									dataArray[i].push(rData.refData[j]);
									console.log(dataArray[i]);
								}
								//console.log('ghkl');
								//console.log(rData.refData[j]);
							}*/
							//console.log(dataArray);
						}
						callback();
					}).error(function(err) {
					});
				}
				
			}
			
			
			var dropdown = new dropdownFactory.createDropdown({searchable: true});
			
			
			//doSearch(function(){dropdown.setData(dataArray);});
			dropdown.onSearchChanged = function() {
				doSearch(function() {
					dropdown.setData(dataArray);
				});
			};
			
			buttonShowDropdown.on('click', function() {
				if (dropdown.isVisible()) {
					dropdown.hide();
				} else {
					dropdown.show();
					doSearch(function(){dropdown.setData(dataArray);});
				}
			});
			
			elm.on('keydown', function(evt) {
				switch (evt.keyCode) {
					case 40: // key down
						if (!dropdown.isVisible()) {
							dropdown.show();
							doSearch(function(){dropdown.setData(dataArray);});
						}
						evt.preventDefault();
						break;
					case 38: // key up
						evt.preventDefault();
						break;
					case 13: // key enter
						if (!dropdown.isVisible()) {
							dropdown.show();
							doSearch(function(){dropdown.setData(dataArray);});
						}
						evt.preventDefault();
						break;
				}
				// any other key
			});
			
			buttonShowDropdown.on('keydown', function(evt) {
				switch (evt.keyCode) {
					case 40: // key down
						if (!dropdown.isVisible()) {
							dropdown.show();
							doSearch(function(){dropdown.setData(dataArray);});
						}
						evt.preventDefault();
						break;
					case 38: // key up
						evt.preventDefault();
						break;
					case 13: // key enter
						if (!dropdown.isVisible()) {
							dropdown.show();
							doSearch(function(){dropdown.setData(dataArray);});
						}
						evt.preventDefault();
						break;
				}
				// any other key
			});
			
			buttonShowDropdown.on('focus', function(evt){
				dropdown.cancelTimeout();
			});
			
			// override dropdown select functionality
			dropdown.onSelected = function(index) {
			console.log('stalacilo');
				ngModel.$setViewValue(dataArray[index]);
				ngModel.$render();
				//commitChange(index);
				this.hide();
				elm[0].focus();
			};
			wrapper.append(dropdown.getDropdownElement());

			// if there is psui-form-ctrl bind active component change and close dropdown
			var psuiFormCtrl;
			if (ctrls[1]) {
				var psuiFormCtrl = ctrls[1];

				scope.$watch(
					psuiFormCtrl.getActiveControl,
					function(newVal, oldVal) {
						if (newVal !== elm && oldVal === elm) {
							dropdown.hide();
						}
					}
				);
			}
		}
	};
}]);
