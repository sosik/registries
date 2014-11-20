(function(angular) {
	'use strict';

	angular.module('x-registries')
	.controller('xViewController', ['$scope', function($scope) {
		$scope.schema = {
			type: 'object',
			title: 'Nadpis',
			properties: {
				baseData: {
					type: 'object',
					title: 'Základné údaje',
					properties: {
						name: {
							type: 'string',
							title: 'Meno'

						},
						surName: {
							type: 'string',
							title: 'Priezvisko'
						},
						birthDate: {
							type: 'date',
							title: 'Dátum narodenia'
						}
						
					}
				},
				sbaseData: {
					type: 'object',
					title: 'Základné údaje',
					properties: {
						name: {
							type: 'string',
							title: 'Meno'

						},
						surName: {
							type: 'string',
							title: 'Priezvisko'
						}
					}
				}
			}
		};

		$scope.model = {};
		$scope.model.data = {
			baseData: {
				name: 'meno',
				surName: 'priezvisko',
				birthDate: '20141212'
			}
		};


	}]);
}(angular));
