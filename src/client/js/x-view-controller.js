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
							type: 'string',
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
				birthDate: '21.12.2014'
			}
		};


	}]);
}(angular));
