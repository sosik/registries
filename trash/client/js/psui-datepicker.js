'use strict';

angular.module('psui-datepicker', [])
.directive('psuiDatepicker', ['$timeout', '$compile','$translate', function ($timeout, $compile, $translate) {
	return {
		restrict: 'AE',
		scope: {
			ngModel: "=?"
		},
		require: ['?ngModel'],
		link: function(scope, elm, attrs, ctrls) {
		
		
			var ngModel = null;
			if (ctrls && ctrls[0]) {
				ngModel = ctrls[0];
			}

			// use empty function to commit data, it will be overriden if there is ngModel
			var commitData = function() {
			}
			
			var commitDataDiv = function() {
			}

			if (ngModel) {
				ngModel.$formatters.push(function(value) {
					if (value) {
						var year = value.substring(0,4);
						var month = value.substring(4,6);
						var day = value.substring(6,8);
						if (year.length === 4 && month.length === 2 && day.length === 2) {
							var d = new Date(year, month-1, day);

							return d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear();
						}

						return value;
					}
					return '';
				});

				ngModel.$parsers.push(function(value) {
					if (value) {
						var d = new Date();
						var s = value.split('.');
						if (s.length === 3) {
							var day = parseInt(s[0]);
							var month = parseInt(s[1]);
							var year = parseInt(s[2]);

							if ((day > 0 && day < 32) &&
								(month > 0 && month <13) &&
								(year > 0 && year < 10000)
							   ) {
									d.setYear(year);
									d.setMonth(month -1);
									d.setDate(day);

									var ys = d.getFullYear().toString(10);
									var ms = (d.getMonth() + 1).toString(10);
									if (ms.length < 2) {
										ms = '0'.concat(ms);
									}
									var ds = d.getDate().toString();
									if (ds.length < 2) {
										ds = '0'.concat(ds);
									}

									return ys.concat(ms, ds);
								}
							// invalid
							return '';
						}
						// invalid
						return '';

					}
				});
				commitData = function() {
					ngModel.$setViewValue(elm.val());
				}
				
				commitDataDiv = function() {
					ngModel.$setViewValue(elm.text());
				}
			}
		
		
		
		
		
		
			var wrapper;
			var isDropdownVisible = false;
			var state = 0;
			// create base html elements
			if (elm.parent().hasClass('psui-wrapper')) {
				// element is wrapped, we are going to use this wrapper
				wrapper = elm.parent();
			} else {
				// there is no wrapper, we have to create one
				wrapper = angular.element('<div class="psui-wrapper"></div>');
				elm.wrap(wrapper);
			}
			
			if (elm.nodeName === "psui-datepicker") {
				// we are element
			} else {
				// we are attribute
			}

			elm.addClass('psui-datepicker');
			var dropdown = angular.element('<div class="psui-dropdown psui-hidden"></div>');
			wrapper.append(dropdown);
			
			dropdown.addClass('psui-datepicker-dropdown');
			
			dropdown.attr('tabindex',0);
			var buttonsHolder = angular.element('<div class="psui-buttons-holder"></div>');
			wrapper.append(buttonsHolder);
			
			var buttonShowDropdown = angular.element('<button type="button" class="btn psui-icon-calendar"></button>');
			buttonShowDropdown.attr('tabindex', -1);
			buttonsHolder.append(buttonShowDropdown);
    
			var dropdownHide = function() {
				dropdown.addClass('psui-hidden');
			};
			
			var hideDropdown;
			
			dropdown.on('focus',function(evt){		
				$timeout.cancel(hideDropdown);
				hideDropdown = null;
				dropdown.removeClass('psui-hidden');
			})
			
			dropdown.on('blur',function(evt){
				//dropdown.addClass('psui-hidden');
				hideDropdown = $timeout(dropdownHide, 3, false);
			})
			
			elm.on('blur',function(evt){
				hideDropdown = $timeout(dropdownHide, 3, false);
				
				state=0;
			})
			
			elm.on('focus',function(evt){
				dropdown.addClass('psui-hidden');
				state=1;
			})
			
			elm.on('click',function(evt){
				if (state =1){
					dropdown.addClass('psui-hidden');
				}
			})
			
			buttonShowDropdown.on('blur',function(evt){
				hideDropdown = $timeout(dropdownHide, 3, false);
			})
			
			var selDate;
			
			buttonShowDropdown.on('click', function(evt) {
				if(hideDropdown>0){
					$timeout.cancel(hideDropdown);
					hideDropdown = null;
					dropdown.removeClass('psui-hidden');
				}
				
				if (dropdown.hasClass('psui-hidden')) {
					dropdown.removeClass('psui-hidden');
					if (elm.val()){
						var arr = elm.val().split(".");
						if((arr[0] && arr[1] && arr[2]) && arr[0]>0 && arr[0]<32 && arr[1]>0 && arr[1]<13){
							scope.$apply(function(){
								arr[1]= arr[1]-1;
								var datum = new Date(arr[2], arr[1], arr[0]);
								selDate = new Date(datum.getTime());
								dateTbody.empty();
								makeDateTable(datum);
								});
						}
					}
					
				} else {
					dropdown.addClass('psui-hidden');
				}
			});
			
			elm.on('dblclick', function(evt){
				if (dropdown.hasClass('psui-hidden')) {
					if(elm.val()){
						var arr = elm.val().split(".");
						if((arr[0] && arr[1] && arr[2]) && arr[0]>0 && arr[0]<32 && arr[1]>0 && arr[1]<13){
							scope.$apply(function(){
								arr[1]= arr[1]-1;
								var datum = new Date(arr[2], arr[1], arr[0]);
								selDate = new Date(datum.getTime());
								dateTbody.empty();
								makeDateTable(datum);
							});
						}
					}
					dropdown.removeClass('psui-hidden');
				} else {
					dropdown.addClass('psui-hidden');
				}
			})
			
			var dateTable = angular.element('<table></table>');
			var dateTbody = angular.element('<tbody></tbody>');
			dateTable.append(dateTbody);
			dropdown.append(dateTable);
			
			
			var whichMonth = function(month){
				if (month == 0){
					return "{{\'date.jan\' | translate}}";
				}else if (month == 1){
					return "{{\'date.feb\' | translate}}";
				}else if (month == 2){
					return "{{\'date.mar\' | translate}}";
				}else if (month == 3){
					return "{{\'date.apr\' | translate}}";
				}else if (month == 4){
					return "{{\'date.may\' | translate}}";
				}else if (month == 5){
					return "{{\'date.jun\' | translate}}";
				}else if (month == 6){
					return "{{\'date.jul\' | translate}}";
				}else if (month == 7){
					return "{{\'date.aug\' | translate}}";	
				}else if (month == 8){
					return "{{\'date.sep\' | translate}}";
				}else if (month == 9){
					return "{{\'date.oct\' | translate}}";
				}else if (month == 10){
					return "{{\'date.nov\' | translate}}";
				}else if (month == 11){
					return "{{\'date.dec\' | translate}}";
				}
			}
			
			
			var makeDateTable = function(date){
				var tr,td;
				tr = angular.element('<tr class="header"></tr>');
			
				td = angular.element('<td class="action-previous"></td>'); 
				td.data("datum",new Date(date.getTime()));
				td.on('click', function(evt){
					
					
					scope.$apply(function(){
						var element = angular.element(evt.target);
						var prevMonth = new Date (element.data("datum").getTime());
						prevMonth.setMonth(prevMonth.getMonth()-1);
						dateTbody.empty();
						makeDateTable(prevMonth);
					});
					
				})
				tr.append(td);
				td = angular.element('<td colspan="5" class="action-date">' + whichMonth(date.getMonth()) + ' ' + date.getFullYear() + '</td>'); 
				td.data("datum",new Date(date.getTime()));
				td.on('click',function(evt){
					scope.$apply(function(){
						var element = angular.element(evt.target);
						var thisMonth = new Date (element.data("datum").getTime());
						dateTbody.empty();
						makeMonthTable(thisMonth);
					});
				})
				tr.append(td);
				td = angular.element('<td  class="action-next"></td>'); 
				td.data("datum",new Date(date.getTime()));
				td.on('click', function(evt){
					
					
					scope.$apply(function(){
						var element = angular.element(evt.target);
						var nextMonth = new Date (element.data("datum").getTime());
						nextMonth.setMonth(nextMonth.getMonth()+1);
						dateTbody.empty();
						makeDateTable(nextMonth);
					});
				})
				tr.append(td);
				dateTbody.append(tr);
				
				tr = angular.element('<tr class="header">></tr>');
				td = angular.element('<td colspan="7" class="action-current-day">{{\'date.current.day\' | translate}}</td>');
				td.data("datum", new Date() );
				td.on('click', function(evt){
				
					
					scope.$apply(function(){
						var element = angular.element(evt.target);
						var curDate = new Date (element.data("datum").getTime());
						dateTbody.empty();
						makeDateTable(curDate);
					});
				
				})
				tr.append(td);
				dateTbody.append(tr);
				
				tr = angular.element('<tr class="labels"></tr>');
				
				td = angular.element('<td>{{\'date.monday\' | translate}}</td>'); 
				tr.append(td);
				td = angular.element('<td>{{\'date.tuesday\' | translate}}</td>'); 
				tr.append(td);
				td = angular.element('<td>{{\'date.wednesday\' | translate}}</td>');
				tr.append(td);
				td = angular.element('<td>{{\'date.thursday\' | translate}}</td>'); 
				tr.append(td);
				td = angular.element('<td>{{\'date.friday\' | translate}}</td>'); 
				tr.append(td);
				td = angular.element('<td>{{\'date.saturday\' | translate}}</td>'); 
				tr.append(td);
				td = angular.element('<td>{{\'date.sunday\' | translate}}</td>');
				tr.append(td);
				
				dateTbody.append(tr);
				
				var currentDate = new Date;
				
				var month = date.getMonth();
				var dayNumber = date.getDate();
				date.setDate(date.getDate()-dayNumber +1);
				
				var whichDay = date.getDay() -1;
				if (whichDay == -1){
					whichDay = 6;
				}
				
				var curClass = "";
				var selClass = "";
				if (whichDay == 0){
				date.setDate(date.getDate()-7);
				}else {
				date.setDate(date.getDate()- whichDay);
				}
				
			
				
				for (var i = 0; i<6; i++){
					tr = angular.element('<tr class="days"></tr>');
					for (var j = 0; j<7; j++){
						if (month == date.getMonth()){
							if (date.getDate() == currentDate.getDate() && currentDate.getMonth() == date.getMonth() && currentDate.getFullYear() == date.getFullYear()){
								curClass="current"
							} else {
								curClass="";
							}
							if (selDate && date.getDate() == selDate.getDate() && selDate.getMonth() == date.getMonth() && selDate.getFullYear() == date.getFullYear()){
								selClass="selected";
							} else {
								selClass="";
							}
							td = angular.element('<td class="'+ curClass + ' ' + selClass +'">' + date.getDate() + '</td>');
						} else{
							td = angular.element('<td class="other">' + date.getDate() + '</td>');
						}
						td.data("datum",new Date(date.getTime()));
						
						td.on('click', function(evt){
							var element = angular.element(evt.target);
							var chosenDay = element.data("datum").getDate();
							var chosenMonth = element.data("datum").getMonth() + 1;
							var chosenYear = element.data("datum").getFullYear();
							
							if (elm[0].nodeName === "DIV"){
								elm.text(chosenDay + '.' + chosenMonth + '.' + chosenYear);
								scope.$apply(commitDataDiv);
							} else {
								elm.val(chosenDay + '.' + chosenMonth + '.' + chosenYear);
								scope.$apply(commitData);
							}
							
							dropdown.addClass('psui-hidden');
						})
						tr.append(td);
						date.setDate(date.getDate() + 1);
					}
					dateTbody.append(tr);
					$compile(dateTbody)(scope);
				}
			
			}
			
			
			var makeMonthTable = function(date){
				var tr,td;
				
				tr = angular.element('<tr class="header">></tr>');
			
				td = angular.element('<td  class="action-previous"></td>'); 
				td.data("datum",new Date(date.getTime()));
				td.on('click', function(evt){
					scope.$apply(function(){
						var element = angular.element(evt.target);
						var prevYear = new Date (element.data("datum").getTime());
						prevYear.setFullYear(prevYear.getFullYear()-1);
						dateTbody.empty();
						makeMonthTable(prevYear);
					});
				})
				tr.append(td);
				td = angular.element('<td colspan="2" class="action-date">' + date.getFullYear() + '</td>'); 
				td.data("datum",new Date(date.getTime()));
				td.on('click',function(evt){
					scope.$apply(function(){
						var element = angular.element(evt.target);
						var thisYear = new Date (element.data("datum").getTime());
						dateTbody.empty();
						makeYearTable(thisYear);
					});
				})
				tr.append(td);
				td = angular.element('<td class="action-next"></td>'); 
				td.data("datum",new Date(date.getTime()));
				td.on('click', function(evt){
					scope.$apply(function(){
						var element = angular.element(evt.target);
						var nextYear = new Date (element.data("datum").getTime());
						nextYear.setFullYear(nextYear.getFullYear()+1);
						dateTbody.empty();
						makeMonthTable(nextYear);
					});
				})
				tr.append(td);
				dateTbody.append(tr);
				
				tr = angular.element('<tr class="header">></tr>');
				td = angular.element('<td colspan="7" class="action-current-day">{{\'date.current.day\' | translate}}</td>');
				td.data("datum", new Date() );
				td.on('click', function(evt){
					scope.$apply(function(){
						var element = angular.element(evt.target);
						var curDate = new Date (element.data("datum").getTime());
						dateTbody.empty();
						makeDateTable(curDate);
					});
				
				})
				tr.append(td);
				dateTbody.append(tr);
				
				var month = 0;
				var dateMonthTable = new Date (date.getTime());
				for (var i = 0; i<3; i++){
					tr = angular.element('<tr class="months"></tr>');
					for (var j = 0; j<4; j++){
						td = angular.element('<td>' + whichMonth(month) + '</td>');
						dateMonthTable.setMonth(month);
						td.data("datum",new Date(dateMonthTable.getTime()));
						
						td.on('click', function(evt){
							scope.$apply(function(){
								var element = angular.element(evt.target);
								var thisDate = new Date (element.data("datum").getTime());
								dateTbody.empty();
								makeDateTable(thisDate);
							});
						})
						tr.append(td);
						month = month + 1;
					}
					dateTbody.append(tr);
					$compile(dateTbody)(scope);
				}
			
			}
			
			var makeYearTable = function(date){
				var tr,td;
				
				tr = angular.element('<tr class="header">></tr>');
			
				td = angular.element('<td class="action-previous"></td>'); 
				td.data("datum",new Date(date.getTime()));
				td.on('click', function(evt){
					scope.$apply(function(){
						var element = angular.element(evt.target);
						var prevYears = new Date (element.data("datum").getTime());
						prevYears.setFullYear(prevYears.getFullYear()-9);
						dateTbody.empty();
						makeYearTable(prevYears);
					});
				})
				tr.append(td);
				td = angular.element('<td></td>'); 
				tr.append(td);
				td = angular.element('<td class="action-next"></td>'); 
				td.data("datum",new Date(date.getTime()));
				td.on('click', function(evt){
					scope.$apply(function(){
						var element = angular.element(evt.target);
						var nextYears = new Date (element.data("datum").getTime());
						nextYears.setFullYear(nextYears.getFullYear()+9);
						dateTbody.empty();
						makeYearTable(nextYears);
					});
				})
				tr.append(td);
				dateTbody.append(tr);
				
				tr = angular.element('<tr class="header">></tr>');
				td = angular.element('<td colspan="7" class="action-current-day">{{\'date.current.day\' | translate}}</td>');
				td.data("datum", new Date() );
				td.on('click', function(evt){
					scope.$apply(function(){
						var element = angular.element(evt.target);
						var curDate = new Date (element.data("datum").getTime());
						dateTbody.empty();
						makeDateTable(curDate);
					});
				})
				tr.append(td);
				dateTbody.append(tr);
				
				var year = date.getFullYear() - 4;
				var dateYearTable = new Date (date.getTime());
				
				for (var i = 0; i<3; i++){
					tr = angular.element('<tr class="years"></tr>');
					for (var j = 0; j<3; j++){
						td = angular.element('<td>' + year + '</td>');
						dateYearTable.setFullYear(year);
						td.data("datum",new Date(dateYearTable.getTime()));
						
						td.on('click', function(evt){
							scope.$apply(function(){
								var element = angular.element(evt.target);
								var thisYear = new Date (element.data("datum").getTime());
								dateTbody.empty();
								makeMonthTable(thisYear);
							});
						})
						tr.append(td);
						year = year + 1;
					}
					dateTbody.append(tr);
					$compile(dateTbody)(scope);
				}
			
			}
			
			
			
			var d = new Date();
			
			makeDateTable(d);
			
			
			
			
		}
	}
}])
