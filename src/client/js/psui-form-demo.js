/*globals angular*/
'use strict';

angular.module('xpsuiFormDemo',['xpsui'])
.controller('xpsuiFormDemoController', ['$scope', '$q', '$timeout', function($scope, $q, $timeout) {
$scope.model = {
	baseData: {
		name: 'prve meno',
		players: [
			{
				name: 'p1',
				surName: 'p1',
			},
			{
				name: 'p2',
				surName: 'p2',
			},
			{
				name: 'p3',
				surName: 'p3',
			}
		]
	}
};

$scope.schema = {
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
				cName: {
					type: 'string',
					title: 'calculatedName',
					readOnly: true,
					transient: true,
					xcalculated: {
						__func__: 'concatenate',
						arg1: {
							__func__: 'getAndWatch',
							path: 'baseData.name'
						},
						arg2: {
							__func__: 'getAndWatch',
							path: 'baseData.surName'
						}
					}
				},
				players: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							name: {
								type: 'string',
								title: 'Meno hráča',
							},
							surName: {
								type: 'string',
								title: 'Priezvisko'
							},
							combo: {
								type: 'string',
								title: 'Combo',
								calculated: {
									__func__: 'concatenate',
									arg1: {
										__func__: 'getAndWatch',
										path: {
											__func__: 'resolveSelfIndex',
											path: 'baseData.players.__INDEX__.name'
										}
									},
									arg2: {
										__func__: 'getAndWatch',
										path: {
											__func__: 'resolveSelfIndex',
											path: 'baseData.players.__INDEX__.surName'
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};

$scope.calc = {
	__func__: 'concatenate',
	v1: 'aa',
	v2: {
		__func__: 'concatenate',
		v1: 'xxx',
		v2:	{
			__func__: 'sum',
			v1: 1,
			v2: 2,
			v3: '3a'
		}
	},
	v3: 'bb'
};

function concatenateFn(params, context, cb) {
	console.log(params);
	var r = '';
	var keys = Object.keys(params);
	keys.sort();

	for (var i = 0; i < keys.length; ++i) {
		r = r.concat(params[keys[i]]);
	}

	$timeout(function() {cb(null, r)});
}

function sumFn(params, context, cb) {
	var r = 0;

	for (var p in params) {
		r += parseFloat(params[p]);
	}

	cb(null, r);
}

function emptyFn(params, context, cb) {
	cb(null, params);
}

function constFn(params, context, cb) {
	cb(null, params.value);
}

function calculate(calcDef, context) {
	if (typeof calcDef === 'object') {
		var deferred = $q.defer();

		var localFn = emptyFn;

		if (calcDef.__func__) {
			switch (calcDef.__func__) {
				case 'const':
					localFn = constFn;
					break;
				case 'sum':
					localFn = sumFn;
					break;
				case 'concatenate':
					localFn = concatenateFn;
					break;
			}
		}
		var params = {};
		for (var p in calcDef) {
			if (typeof calcDef[p] === 'object') {
					params[p] = calculate(calcDef[p], context);
			} else if (p === '__func__') {
				// we do not want func keyword there
				angular.noop();
			} else {
				params[p] = calcDef[p];
			}
		}
		$q.all(params).then(function(results){
			localFn(results, context, function(err, res) {
				if (err) {
					deferred.reject(err);
					return;
				}

				deferred.resolve(res);

			});
		});
		return deferred.promise;
	} else {
		return calcDef;
	}
}

calculate($scope.calc).then(function(result) {
	console.log(result);
})
var r = calculate($scope.calc, {});

}]);
