(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller('xpsui:RegistryCustomGenerateCtrl', ['$scope', '$routeParams', '$http'
		,'xpsui:GeneratorsGenerator', 'xpsui:SchemaUtil', 'xpsui:NotificationFactory', 
		function($scope, $routeParams, $http, generator,schemaUtilFactory, notificationFactory) {
			$scope.model = {};
			// $scope.currentSchemaUri = schemaUtilFactory.decodeUri($routeParams.schema);

			$scope.save=function(){
				generator.save($scope.model,$routeParams.generateBy,function(err,progess){
					if(err){
						notificationFactory.error({translationCode:'registry.unsuccesfully.saved', time:3000});
					} else
					notificationFactory.info({translationCode:'registry.succesfully.saved', time:3000});
				});
			};

			function toXlsHtml(tableHtml){
				var retVal='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta http-equiv=Content-Type content="text/html; charset=utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>';
					retVal+=tableHtml;
					retVal+='</body></html>';
				return retVal;
			}

			$scope.exportTable=function(id){
				var element=document.getElementById(id);

				var data=toXlsHtml(element.innerHTML);

				var blob = new Blob([data], {type: 'application/vnd.ms-excel;charset=utf-8'});
				var url  =  window.webkitURL||window.URL;
				var link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
				link.href = url.createObjectURL(blob);
				link.download = 'export.xls'; // whatever file name you want :)

				var event = document.createEvent('MouseEvents');
				event.initEvent('click', true, false);
				link.dispatchEvent(event);

			};

			function fillClubLogos() {
				var clubIds = [];
				for (var pos=0; pos<$scope.model.listOfTeam.team.length; pos++) {
					(function (position) {
						var rosterId = $scope.model.listOfTeam.team[position].oid;
						$http({
							method : 'GET',
							url : '/udao/getBySchema/uri~3A~2F~2Fregistries~2Frosters~23views~2Frosters~2Fview/' + rosterId,
							data : {
							}
						}).success(function(roster) {
							fillForClub(position, roster.baseData.club.oid);
						}).error(function(err) {
							callback(err);
						});
					}(pos));
				}

			}

			function fillForClub(position, clubOid) {
				$http({
					method : 'GET',
					url : '/udao/getBySchema/uri~3A~2F~2Fregistries~2Forganizations~23views~2Fclub~2Fview/' + clubOid,
					data : {
					}
				}).success(function(club) {
					$scope.model.listOfTeam.team[position].photo = club.logoInfo.photo;
				}).error(function(err) {
					callback(err);
				});
			}

			// /registry/generated/:schemaFrom/:idFrom/:generateBy/:template
			$http({ method : 'GET',url: '/udao/getBySchema/'+$routeParams.schemaFrom+'/'+ $routeParams.idFrom})
			.success(function(data, status, headers, config){
				$scope.model = data;
				generator.generate(data,$routeParams.generateBy,function(err,progess){
					if(err){
						notificationFactory.error({translationCode:'registry.unsuccesfully.generated', time:3000});
					} else
					notificationFactory.info({translationCode:'registry.succesfully.generated', time:3000});
					fillClubLogos();
				});

			}).error(function(err) {
				notificationFactory.error(err);
				fillClubLogos();
			});
		}
	]);
}(window.angular));
