(function(angular) {
	'use strict';

	/**
	 * @module xpsui:controllers
	 */
	angular.module('xpsui:controllers')
		/**
		 *
		 * Requires:
		 * * #routeParams contain 'schema' 
		 */
	.controller('xpsui:RegistrySearchCtrl', [ 
		'$scope', 
		'$routeParams',
		'xpsui:SchemaUtil',
		'$translate',
		'xpsui:HttpHandlerFactory',
		'$parse',
		'xpsui:logging',
		'xpsui:QueryFilter',
		function($scope, $routeParams, schemaUtil, $translate, httpFactory, $parse, log, QueryFilter) {

			var httpHandler = httpFactory.newHandler();

			//FIXME this function must be replaced by generic objecttools function shared among client and server if poosible
			$scope.objectPathToSchemaPath = function(objPath) {
				if (objPath) {
					return 'properties.'+objPath.replace(/\./g, '.properties.');
				} else {
					return null;
				}
			};
			
			$scope.fieldWeigth = function(field) {
				if (field.render && field.render.width) {
					if (field.render.width == 'narrow') {
						return '2 0 100px';
					} else if (field.render.width == 'wide') {
						return '50 0 150px';
					}
				}
				return '10 0 200px';
			}

			$scope.limit = 50;
			$scope.moreData = false;
			$scope.isSearching = false;
			$scope.isExporting = false;

			// current sort definition
			$scope.currSort = {
				field: null,
				order: QueryFilter.sort.ASC
			};

			$scope.sort = QueryFilter.sort;

			$scope.addNewCrit = function() {
				$scope.searchCrits.push({
					op: $scope.allOps[0]
				});
			};

			$scope.removeCrit = function(idx) {
				$scope.searchCrits.splice(idx, 1);
			};

			/**
			 * Changes search sort order by field.
			 * Order of sort can be changed by consequent use of function with
			 * same field name.
			 *
			 * @param {string} field name of parameter
			 *
			 */
			$scope.changeSort = function(field) {
				if ($scope.currSort.field == field) {
					// same field clicked twice, change sort order

					if ($scope.currSort.order == QueryFilter.sort.ASC) {
						$scope.currSort.order = QueryFilter.sort.DESC;
					} else {
						$scope.currSort.order = QueryFilter.sort.ASC;
					}
				}

				$scope.currSort.field = field;

				$scope.search();
			};

			$scope.filterKeyPressed = function (event) {
				if(event.which === 13) {
					$scope.search();
				}
			}

			$scope.exportCsv = function() {
				$scope.isExporting = true;

				setTimeout(function() {
					var data = $scope.data

					var htmlData = [];
					htmlData.push('<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta http-equiv=Content-Type content="text/html; charset=utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table id="tblExport" style="border:1px solid black; "><thead><tr>');
					for (var li in $scope.schema.listFields) {
						var lisDef=$scope.schema.listFields[li];
						htmlData.push('<th>'+lisDef.title+'</th>');
					}
					htmlData.push('<tr></thead><tbody>');

					for (var item=0; item<data.length; item++) {
						htmlData.push('<tr>');
						for (var li=0; li<$scope.schema.listFields.length; li++) {
							var field = $scope.schema.listFields[li].field;
							var value = data[item][field];
							if (value && value.refData) {
								var text = "";
								var sep = "";
								for (var key in value.refData) {
									text = text + sep + value.refData[key];
									sep = " | ";
								}
								htmlData.push('<td>' + text +'</td>');
							} else if (value || value === 0) {
								htmlData.push('<td>' + value + '</td>');
							} else {
								htmlData.push('<td></td>');
							}
						}
						htmlData.push('</tr>');
					}
					htmlData.push('</tbody></table></body></html>');

					var blob = new Blob([htmlData.join('')], {type: 'application/vnd.ms-excel;charset=utf-8'});
					var url  =  window.webkitURL||window.URL;
					var link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
					link.href = url.createObjectURL(blob);
					link.download = 'search-export.xls'; // whatever file name you want :)

					var event = document.createEvent('MouseEvents');
					event.initEvent('click', true, false);
					link.dispatchEvent(event);

					$scope.$apply(function () {
						$scope.isExporting = false;
					});
				}, 10);
			};

			$scope.setSearch = function(field) {
			};

			$scope.search = function() {
				$scope.model = [];
				$scope.data = [];
				$scope.moreData = false;
				$scope.currPage = 0;
				fetchData();
			};

			$scope.next = function() {
				++$scope.currPage;
				fetchData();
			};

			$scope.findFieldDefinition = function(fieldPath) {
				for (var i = 0; i < $scope.schemaFields.length; i++) {
					if (fieldPath == $scope.schemaFields[i].path) {
						return $scope.schemaFields[i];
					}
				}
			};

			function fetchData() {
				$scope.isSearching = true;

				var qf = QueryFilter.create();
				
				// add criteria
				for (var i = 0; i <$scope.searchCrits.length; ++i) {
					// skip criteria with empty field
					if ($scope.searchCrits[i].field) {
						var val = $scope.searchCrits[i].val;
						var path = $scope.searchCrits[i].field.path;

						var fieldDef = $scope.findFieldDefinition($scope.searchCrits[i].field.path);
						if (fieldDef
							&& fieldDef.fragment.type == 'number'
							&& val == parseInt(val)) {
							val = parseInt(val);
						}
						if (fieldDef
								&& fieldDef.fragment.type == 'object'
								&& val.oid) {
							val = $scope.searchCrits[i].val.oid;
							path = $scope.searchCrits[i].field.path + '.oid';
						}
						if (fieldDef
								&& fieldDef.fragment.type == 'array'
								&& val
								&& val.length > 0) {
							path = $scope.searchCrits[i].field.path + '.oid';
							var oids = [];
							for (var i=0; i<val.length; i++) {
								oids.push(val[i].oid);
							}
							qf.addCriterium(
									path,
									'in',
									oids
								);
							continue;
						}
						qf.addCriterium(
							path,
							QueryFilter.operation[$scope.searchCrits[i].op.op],
							val
						);
					}
				}

				// add fields
				for (i = 0; i < $scope.schema.listFields.length; ++i) {
					qf.addField($scope.schema.listFields[i].field);
				}
				qf.addField('id'); //ID should be always returned

				// add sorts and limits
				qf.addSort($scope.currSort.field, $scope.currSort.order)
					.setSkip($scope.currPage * $scope.limit)
					.setLimit($scope.limit + 1);

				console.log(qf);
				httpHandler.http({
					url: '/search/' + schemaUtil.encodeUri(schemaUri),
					method: 'POST',
					data: qf
				}).then(function(data) {
					//success

					var d = data.data;
					$scope.isSearching = false;
					if (d.length > $scope.limit) {
						$scope.moreData = true;
						d = d.slice(0,$scope.limit);
					} else {
						$scope.moreData = false;
					}
					$scope.model = $scope.model.concat(d);
					$scope.data = $scope.data.concat(flattenData(d, $scope.schema.listFields));
				}, function(err) {
					// error
					// FIXME notification
				});
			}

			var schemaUri = schemaUtil.decodeUri($routeParams.schema);
			$scope.schema = null;
			$scope.model = [];
			$scope.data = [];

			// prepare known operations
			$scope.allOps = [];
			
			for (var i in QueryFilter.operation) {
				if (QueryFilter.operation.hasOwnProperty(i)) {
					$scope.allOps.push({
						text: $translate.instant('queryfilter.ops.' + (QueryFilter.operation[i].text || i)),
						op: (QueryFilter.operation[i].code || i)
					});
				}
			}

			$scope.searchCrits = []; // actual row

			function flattenSchema(schema, path, group) {
				var result = [];

				if (!(path && angular.isArray(path))) {
					path = [];
				}

				if (schema.properties) {
					for (var propertyName in schema.properties) {
						if (schema.properties.hasOwnProperty(propertyName)) {
							var property = schema.properties[propertyName];
							var propertyTitle = $translate.instant(property.transCode || property.title);
							var localPath = path.concat(propertyName);

							if (property.properties) {
								result = result.concat(flattenSchema(property, localPath, propertyTitle));
							} else {
								// property has no additional properties
								result.push({
									name: propertyTitle,
									path: localPath.join('.'),
									group: group,
									fragment: property
								});

							}
						}
					}
				}

				return result;
			}

			function flattenData(data, fields) {
				var result = [];

				if (data && angular.isArray(data)) {
					for (var d in data) {
						var dataRow= {};
						for (var f in fields) {
							dataRow[fields[f].field] = $parse(fields[f].field)(data[d]);
						}

						result.push(dataRow);
					}
				}

				return result;
			}

			schemaUtil.getCompiledSchema(schemaUri)
			.success(function(data) {
					$scope.schema = data;
					$scope.schemaFields = flattenSchema(data, '');
					// FIXME check if schema is correct, there has to be at least one field
					$scope.currSort.field  = $scope.schema.listFields[0].field;
					$scope.addNewCrit();
				}
			)
			.error(function() {
				log.error('Failed to get schema');
				//TODO notification anbout error state
			});

		}]);

}(window.angular));

