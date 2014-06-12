'use strict';

angular.module('psui-datepicker', ['psui'])
.directive('psuiDatepicker', ['psui.dropdownFactory', function (dropdownFactory) {
	return {
		restrict: 'AE',
		link: function(scope, elm, attrs, ctrls) {
			var wrapper;
			var isDropdownVisible = false;
			
			// create base html elements
			if (elm.parent().hasClass('psui-wrapper')) {
				// element is wrapped, we are going to use this wrapper
				wrapper = elm.parent;
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
			
			/*var input = angular.element('<input type="text" name="date">');
			elm.append(input);*/
			
			elm.addClass('psui-datepicker')
			
			var dropdown = angular.element('<div class="psui-dropdown psui-hidden"></div>');
			wrapper.append(dropdown);
			
			var buttonsHolder = angular.element('<div class="psui-buttons-holder"></div>');
			wrapper.append(buttonsHolder);
			
			var buttonShowDropdown = angular.element('<button><b>v</b></button>');
			buttonsHolder.append(buttonShowDropdown);
			buttonShowDropdown.on('click', function(evt) {
				if (dropdown.hasClass('psui-hidden')) {
					dropdown.removeClass('psui-hidden');
				} else {
					dropdown.addClass('psui-hidden');
				}
			});
			
			elm.on('dblclick', function(evt){
				if (dropdown.hasClass('psui-hidden')) {
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
					return "Jan";
				}else if (month == 1){
					return "Feb";
				}else if (month == 2){
					return "Mar";
				}else if (month == 3){
					return "Apr";
				}else if (month == 4){
					return "Maj";
				}else if (month == 5){
					return "Jun";
				}else if (month == 6){
					return "Jul";
				}else if (month == 7){
					return "Aug";	
				}else if (month == 8){
					return "Sep";
				}else if (month == 9){
					return "Okt";
				}else if (month == 10){
					return "Nov";
				}else if (month == 11){
					return "Dec";
				}
			}
			
			
			var makeDateTable = function(date){
				var tr,td;
				
				tr = angular.element('<tr class="month"></tr>');
			
				td = angular.element('<td>&laquo;</td>'); 
				td.data("datum",new Date(date.getTime()));
				td.on('click', function(evt){
					
					var element = angular.element(evt.target);
					var prevMonth = new Date (element.data("datum").getTime());
					prevMonth.setMonth(prevMonth.getMonth()-1);
					dateTbody.empty();
					makeDateTable(prevMonth);
				})
				tr.append(td);
				td = angular.element('<td colspan="5">' + whichMonth(date.getMonth()) + ' ' + date.getFullYear() + '</td>'); 
				tr.append(td);
				td = angular.element('<td>&raquo;</td>'); 
				td.data("datum",new Date(date.getTime()));
				td.on('click', function(evt){
					
					var element = angular.element(evt.target);
					var nextMonth = new Date (element.data("datum").getTime());
					nextMonth.setMonth(nextMonth.getMonth()+1);
					dateTbody.empty();
					makeDateTable(nextMonth);
				})
				tr.append(td);
				dateTbody.append(tr);
				
				tr = angular.element('<tr class="month"></tr>');
				td = angular.element('<td colspan="7">Current Day</td>');
				td.data("datum", new Date() );
				td.on('click', function(evt){
				
					var element = angular.element(evt.target);
					var curDate = new Date (element.data("datum").getTime());
					dateTbody.empty();
					makeDateTable(curDate);
				
				})
				tr.append(td);
				dateTbody.append(tr);
				
				tr = angular.element('<tr class="days"></tr>');
				
				td = angular.element('<td>Po</td>'); 
				tr.append(td);
				td = angular.element('<td>Ut</td>'); 
				tr.append(td);
				td = angular.element('<td>St</td>'); 
				tr.append(td);
				td = angular.element('<td>Št</td>'); 
				tr.append(td);
				td = angular.element('<td>Pi</td>'); 
				tr.append(td);
				td = angular.element('<td>So</td>'); 
				tr.append(td);
				td = angular.element('<td>Ne</td>'); 
				tr.append(td);
				
				dateTbody.append(tr);
				
				var month = date.getMonth();
				
				var dayNumber = date.getDate();
				date.setDate(date.getDate()-dayNumber +1);
				
				var whichDay = date.getDay() -1;
				if (whichDay == -1){
					whichDay = 6;
				}
				
				
				
				if (whichDay == 0){
				date.setDate(date.getDate()-7);
				}else {
				date.setDate(date.getDate()- whichDay);
				}
				
				
				
				for (var i = 0; i<6; i++){
					tr = angular.element('<tr></tr>');
					for (var j = 0; j<7; j++){
						if (month == date.getMonth()){
							td = angular.element('<td>' + date.getDate() + '</td>');
						} else{
							td = angular.element('<td class="other">' + date.getDate() + '</td>');
						}
						td.data("datum",new Date(date.getTime()));
						
						td.on('click', function(evt){
							var element = angular.element(evt.target);
							var chosenDay = element.data("datum").getDate();
							var chosenMonth = element.data("datum").getMonth() + 1;
							var chosenYear = element.data("datum").getFullYear();
							console.log(elm[0].nodeName);
							if (elm[0].nodeName == "DIV"){
								elm.text(chosenDay + '.' + chosenMonth + '.' + chosenYear);
							} else {
								elm.val(chosenDay + '.' + chosenMonth + '.' + chosenYear);
							}
							dropdown.addClass('psui-hidden');
						})
						tr.append(td);
						date.setDate(date.getDate() + 1);
					}
					dateTbody.append(tr);
				}
			
			}
			
			var d = new Date();
			
			makeDateTable(d);
			
		}
	}
}])