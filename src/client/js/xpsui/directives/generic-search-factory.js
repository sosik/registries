(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:GenericSearchFactory', [ '$http', 'xpsui:SchemaUtil', '$translate', function($http, schemaUtilFactory, $translate) {
		var service = {};

		service.getSearch = function(searchSchema, crits,sortBy,skip,limit) {

			return $http({
				method : 'POST',
				url : '/search/' + schemaUtilFactory.encodeUri(schemaUtilFactory.concatUri(searchSchema,'search')),
				data : {
					crits : crits,
					sorts: sortBy,
					limit: limit,
					skip: skip
				}
			});
		};


		service.getSearchCount = function(searchSchema, crits) {

			return $http({
				method : 'POST',
				url : '/search/count/' + schemaUtilFactory.encodeUri(schemaUtilFactory.concatUri(searchSchema,'search')),
				data : {
					crits : crits
				}
			});
		};

		service.parseSearchDef = function(schema) {

			var retval = {};

			function collectProperties(pathPrefix, objectDef,group,resultArr) {
				for ( var pr in objectDef.properties) {

						if (objectDef.properties[pr].objectLink2) {
							resultArr.push({
								path: pathPrefix + pr+'.oid',
								type: objectDef.properties[pr].type,
								render:{objectLink2:objectDef.properties[pr].objectLink2},
								schemaFragment:objectDef.properties[pr],
								group:group,
								title: (objectDef.properties[pr].transCode ? $translate.instant(objectDef.properties[pr].transCode) : objectDef.properties[pr].title)
							});

						continue;
					}

					//FIXME: change to datetype
					if ('render' in objectDef.properties[pr] && objectDef.properties[pr].render.component==='psui-datepicker' ) {
							resultArr.push({
								path: pathPrefix + pr,
								type: objectDef.properties[pr].type,
								render:{datepicker:true},
								schemaFragment:objectDef.properties[pr],
								group:group,
								title: (objectDef.properties[pr].transCode ? $translate.instant(objectDef.properties[pr].transCode) : objectDef.properties[pr].title)
							});

						continue;
					}


					if (objectDef.properties[pr].type === 'object') {



						collectProperties(pr + '.', objectDef.properties[pr],objectDef.properties[pr].transCode ? $translate.instant(objectDef.properties[pr].transCode) :objectDef.properties[pr].title, resultArr);



					} else {
						resultArr.push({
							path: pathPrefix + pr,
							type: objectDef.properties[pr].type,
							group:group,
							title: objectDef.properties[pr].transCode ? $translate.instant(objectDef.properties[pr].transCode) : objectDef.properties[pr].title
						});
					}
				}

			}


			retval.schema = schema.url;
			retval.attributes = [];
			retval.operators = [ {
				title: '=',
				value: 'eq'
			}, {
				title: '>',
				value: 'gt'
			},
			{
				title: '>=',
				value: 'gte'
			},  {
				title: '<',
				value: 'lt'
			},
			 {
				title: '<=',
				value: 'lte'
			},  {
				title: 'je iné ako',
				value: 'neq'
			}, {
				title: 'začína s',
				value: 'starts'
			},{
				title: 'obsahuje',
				value: 'contains'
			},
			 {
				title: 'má vyplnené',
				value: 'ex'
			} ];

			collectProperties('', schema,null, retval.attributes);

			return retval;

		};

		return service;
	} ]);

}(window.angular));
