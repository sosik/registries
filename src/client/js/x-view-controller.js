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
						"coach": {
							"title": "Tréner",
							"type": "string",
							"objectlink2": {
								schema: 'schema2',
								fields: {
									'surname': "baseData.surName",
									'name': "baseData.name",
									'licence': "coach.coachLicence",
									'cretedOn': "baseData.createdOn"
								}
							}
						},
						country: {
							type: 'string',
							title: 'Country',
							"enum": [
								'United States of America', 'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua & Deps', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina', 'Burma', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Rep', 'Chad', 'Chile', 'People\'s Republic of China', 'Republic of China', 'Colombia', 'Comoros', 'Democratic Republic of the Congo', 'Republic of the Congo', 'Costa Rica,', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Danzig', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gaza Strip', 'The Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Holy Roman Empire', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Republic of Ireland', 'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jonathanland', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'North Korea', 'South Korea', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mount Athos', 'Mozambique', 'Namibia', 'Nauru', 'Nepal', 'Newfoundland', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman', 'Ottoman Empire', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Prussia', 'Qatar', 'Romania', 'Rome', 'Russian Federation', 'Rwanda', 'St Kitts & Nevis', 'St Lucia', 'Saint Vincent & the', 'Grenadines', 'Samoa', 'San Marino', 'Sao Tome & Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad & Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
							]
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

		$scope.schema2 = {
			type: 'object',
			title: 'Nadpis',
			properties: {
				baseData: {
					type: 'object',
					title: 'Základné údaje',
					properties: {
						surName: {
							type: 'string',
							title: 'Priezvisko'
						},
						name: {
							type: 'string',
							title: 'Meno'
						},
						createdOn: {
							type: 'date',
							title: 'Created'
						}
					}
				},
				coach: {
					type: 'object',
					title: 'Základné údaje',
					properties: {
						coachLicence: {
							type: 'string',
							title: 'Licencia'

						}

					}
				}
			}
		};

		// $scope.schema = {
		// 	type: 'object',
		// 	title: 'Nadpis',
		// 	properties: {
		// 		baseData: {
		// 			type: 'object',
		// 			title: 'Základné údaje',
		// 			properties: {
		// 				"coach": {
		// 					"title": "Tréner",
		// 					"type": "object",
		// 					"$objectLink": {
		// 						"surName": "baseData.surName",
		// 						"firstName": "baseData.name",
		// 						"coachLicence": "coach.coachLicence"
		// 					}
		// 				},
		// 				country: {
		// 					type: 'string',
		// 					title: 'Country',
		// 					"enum": [
		// 						'United States of America', 'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua & Deps', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina', 'Burma', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Rep', 'Chad', 'Chile', 'People\'s Republic of China', 'Republic of China', 'Colombia', 'Comoros', 'Democratic Republic of the Congo', 'Republic of the Congo', 'Costa Rica,', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Danzig', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gaza Strip', 'The Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Holy Roman Empire', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Republic of Ireland', 'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jonathanland', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'North Korea', 'South Korea', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mount Athos', 'Mozambique', 'Namibia', 'Nauru', 'Nepal', 'Newfoundland', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman', 'Ottoman Empire', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Prussia', 'Qatar', 'Romania', 'Rome', 'Russian Federation', 'Rwanda', 'St Kitts & Nevis', 'St Lucia', 'Saint Vincent & the', 'Grenadines', 'Samoa', 'San Marino', 'Sao Tome & Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad & Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
		// 					]
		// 				},
		// 				surName: {
		// 					type: 'string',
		// 					title: 'Priezvisko'
		// 				},
		// 				birthDate: {
		// 					type: 'date',
		// 					title: 'Dátum narodenia'
		// 				}
		// 			}
		// 		},
		// 		sbaseData: {
		// 			type: 'object',
		// 			title: 'Základné údaje',
		// 			properties: {
		// 				name: {
		// 					type: 'string',
		// 					title: 'Meno'

		// 				},
		// 				surName: {
		// 					type: 'string',
		// 					title: 'Priezvisko'
		// 				}
		// 			}
		// 		}
		// 	}
		// };

		$scope.model = {};
		$scope.model.data = {
			baseData: {
				country: 'Afghanistan',
				surName: 'priezvisko',
				birthDate: '20141212',
				coach: {
					schema:"uri://",
					oid:345,
					refdata:{
						'surname': "John",
						'name': "Hruska",
						'licence': "094567564",
						'cretedOn': "20130923"
					}
				}
			}
		};


	}]);
}(angular));
