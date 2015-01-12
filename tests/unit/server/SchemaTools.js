var expect = require('chai').expect;

describe('SchemaTools', function() {
	var SchemaToolsModule = require(process.cwd() + '/build/server/SchemaTools.js');

	it('extend should work',function(done){

		var simpleSchema1 = {
			"id": "uri://registries/simpleSchema1",
			at1:"test",
			atOver:"shouldBechaged",
			atComplicated:{test:"simpleSchema1" , testOver:"simpleSchema1"},
			shouldNotExist:"aaa"
		};
		var simpleSchema2 = {
			"id": "uri://registries/simpleSchema2",
			extends: "uri://registries/simpleSchema1",
			at2:"test",
			atOver:"changed",
			atComplicated:{ testOver:"simpleSchema2", test2:"test2"},
			shouldNotExist:null
		};

		var schemaTools = new SchemaToolsModule.SchemaTools();
		schemaTools.registerSchema(null,simpleSchema1);
		schemaTools.registerSchema(null	,simpleSchema2);
		schemaTools.parse();
		schemaTools.compile();

		var schema=schemaTools.getSchema('uri://registries/simpleSchema2');
		expect(schema).to.be.not.null();
		expect(schema.compiled).to.be.not.null();
		expect(schema.compiled.at1).to.be.not.null();
		expect(schema.compiled.at2).to.be.not.null();
		expect(schema.compiled.atOver).to.be.eql('changed');
		expect(schema.compiled).to.not.have.property('shouldNotExist');

		// console.log(schemaTools.getSchema('uri://registries/simpleSchema2'));

		done();

	});

	it('Simple schema registration and retriaval', function(done) {
		var simpleSchema1 = {
			"id": "uri://registries/simpleSchema1"
		};
		var schemaTools = new SchemaToolsModule.SchemaTools();

		schemaTools.registerSchema('testURI', simpleSchema1);
		var schema = schemaTools.getSchema('testURI');
		expect(schema.def).to.be.eql(simpleSchema1);

		// schema should be registered with normalized uri
		expect(schemaTools.getSchema('testURI#').def).to.be.eql(simpleSchema1);

		// uri path should be normalized to evalueate .. and .
		schemaTools.registerSchema('http://registries/schema1/../../schema1', simpleSchema1);
		expect(schemaTools.getSchema('http://registries/schema1').def).to.be.eql(simpleSchema1);

		// if there is no uri provided, get id from schema
		schemaTools.registerSchema(null, simpleSchema1);
		expect(schemaTools.getSchema('uri://registries/simpleSchema1').def).to.be.eql(simpleSchema1);

		done();
	});

	it('Base schema parsing', function(done) {
		var simpleSchema1 = {
			"$schema": "http://json-schema.org/schema#",
			"id": "uri://registries/simpleSchema1#",
			"user": {
				"type": "object",
				"properties": {
					"name": {
						"type": "string"
					}
				}
			}
		};
		var simpleSchema2 = {
			"$schema": "http://json-schema.org/schema#",
			"id": "uri://registries/simpleSchema2#",
			"user2": {
				"type": "objeect",
				"properties": {
					"name": {
						"id": "uri://registries/user2#name",
						"type": "string"
					},
					"lastName": {
						"id": "user2#lastName",
						"type": "string"
					},
					"address": {
						"id": "address",
						"type": "object",
						"properties": {
							"street": {
								"type": "object"
							}
						}
					}
				}
			}
		};
		var schemaTools = new SchemaToolsModule.SchemaTools();

		schemaTools.registerSchema(null, simpleSchema1);
		schemaTools.registerSchema(null, simpleSchema2);

		schemaTools.parse();

		expect(schemaTools.getSchema('uri://registries/simpleSchema1').def).to.be.eql(simpleSchema1);
		expect(schemaTools.getSchema('uri://registries/simpleSchema1#user').def).to.be.eql(simpleSchema1.user);
		expect(schemaTools.getSchema(
			'uri://registries/simpleSchema1#user/properties/name').def
		).to.be.eql(simpleSchema1.user.properties.name);

		expect(schemaTools.getSchema('uri://registries/simpleSchema2#').def).to.be.eql(simpleSchema2);
		expect(schemaTools.getSchema('uri://registries/simpleSchema2#user2').def).to.be.eql(simpleSchema2.user2);
		expect(schemaTools.getSchema('uri://registries/user2#name').def).to.be.eql(simpleSchema2.user2.properties.name);
		expect(schemaTools.getSchema(
			'uri://registries/user2#lastName').def
		).to.be.eql(simpleSchema2.user2.properties.lastName);
		expect(schemaTools.getSchema(
			'uri://registries/address').def
		).to.deep.equal(simpleSchema2.user2.properties.address);
		expect(schemaTools.getSchema(
			'uri://registries/address#properties/street').def
		).to.be.eql(simpleSchema2.user2.properties.address.properties.street);


		done();
	});

	it('Base schema compilation', function(done) {
		var schema1 = {
			"$schema": "http://json-schema.org/schema#",
			"id": "uri://registries/common#address",
			"type": "object",
			"properties": {
				"street": {
					"type": "string"
				},
				"houseNo": {
					"type": "string"
				},
				"city": {
					"type": "string"
				},
				"zipCode": {
					"type": "string"
				},
				"country": {
					"type": "string"
				}
			}
		};

		var schema2 = {
			"$schema": "http://json-schema.org/schema#",
			"id": "uri://registries/common#user",
			"type": "object",
			"properties": {
				"firstName": {
					"type": "string"
				},
				"lastName": {
					"type": "string"
				},
				"address": {
					"$ref": "uri://registries/common#address"
				}
			}
		};

		var schemaTools = new SchemaToolsModule.SchemaTools();
		schemaTools.registerSchema(null, schema1);
		schemaTools.registerSchema(null, schema2);

		schemaTools.parse();
		schemaTools.compile();

		compSchema = schemaTools.getSchema('uri://registries/common#user').compiled;
		expect(compSchema).to.have.deep.property('properties.address');
		expect(compSchema).to.have.deep.property('properties.address.properties');
		expect(compSchema).to.have.deep.property('properties.address.properties.street');
		expect(compSchema).to.have.deep.property('properties.address.properties.street.type', 'string');
		expect(compSchema).to.have.deep.property('properties.address.properties.city');
		expect(compSchema).to.have.deep.property('properties.address.properties.city.type', 'string');

		done();
	});

	it('Simple default object extraction', function(done) {
		var securityCredentialsSchema = {
			"$schema": "http://json-schema.org/schema#",
			"id": "uri://registries/common#securityCredentials",
			"type": "object",
			"properties": {
				"permissions": {
					"type": "object",
					"properties": {
						"System User": {
							"title": "Systémový používateľ",
							"description": "Oprávnenie pre interagovanie so systémom",
							"type": "boolean",
							"default": true
						},
						"Registry - read": {
							"title": "Čítane registrov",
							"description": "Oprávnenie pre čítanie dát v registroch",
							"type": "boolean",
							"default": false
						},
						"Registry - write": {
							"title": "Zápis do registrov",
							"description": "Oprávnenie zápis do registrov",
							"type": "boolean",
							"default": true
						}
					}
				}
			}
		};

		var schemaTools = new SchemaToolsModule.SchemaTools();
		schemaTools.registerSchema(null, securityCredentialsSchema);


		schemaTools.parse();
		schemaTools.compile();

		defObj = schemaTools.createDefaultObject("uri://registries/common#securityCredentials");

		expect(defObj).to.have.deep.property('permissions');
		expect(defObj.permissions).to.have.deep.property('System User', true);
		expect(defObj.permissions).to.have.deep.property('Registry - read', false);
		expect(defObj.permissions).to.have.deep.property('Registry - write', true);

		done();
	});

	it('Complex schemas test', function(done) {
		var commonSchema = {
			"$schema": "http://json-schema.org/schema#",
			"id": "uri://registries/common#",
			"address": {
				"type": "object",
				"properties": {
					"street": {
						"type": "string"
					},
					"houseNo": {
						"type": "string"
					},
					"city": {
						"type": "string"
					},
					"zipCode": {
						"type": "string"
					},
					"country": {
						"type": "string"
					}
				}
			},
			"user": {
				"type": "object",
				"properties": {
					"firstName": {
						"type": "string"
					},
					"lastName": {
						"type": "string"
					},
					"securityCredentials": {
						"type": "object",
						"properties": {
							"permissions": {
								"$ref": "uri://registries/common#permissions"
							}
						}
					}
				}
			},
			"permissions": {
				"type": "object",
				"properties": {
					"System User": {
						"title": "Systémový používateľ",
						"description": "Oprávnenie pre interagovanie so systémom",
						"type": "boolean",
						"default": true
					},
					"Registry - read": {
						"title": "Čítane registrov",
						"description": "Oprávnenie pre čítanie dát v registroch",
						"type": "boolean",
						"default": false
					},
					"Registry - write": {
						"title": "Zápis do registrov",
						"description": "Oprávnenie zápis do registrov",
						"type": "boolean",
						"default": true
					}
				}
			}
		};

		var redefSchema = {
			"$schema": "http://json-schema.org/schema#",
			"id": "uri://registries/commonRedef#",
			"address": {"$ref": "uri://registries/common#address"},
			"user": {"$ref": "uri://registries/common#user"},
			"permissions": {"$ref": "uri://registries/common#permissions"}
		};


		var schemaTools = new SchemaToolsModule.SchemaTools();
		schemaTools.registerSchema(null, commonSchema);
		schemaTools.registerSchema(null, redefSchema);

		schemaTools.parse();
		schemaTools.compile();

		var defObj = schemaTools.createDefaultObject("uri://registries/commonRedef#user");

		expect(defObj).to.have.deep.property('securityCredentials');
		expect(defObj).to.have.deep.property('securityCredentials.permissions');
		expect(defObj.securityCredentials.permissions).to.have.deep.property('System User', true);

		done();
	});

	it('$objectLink compilation test', function(done) {
		var objSchema = {
			"id": "uri://test/objSchema#",
			"properties": {
				"name": {
					"type": "string"
				},
				"club": {
					"$objectLink": {
						"registry": "xxx",
						"name": "name",
						"city": "address.city"
					}
				}
			}

		};

		var schemaTools = new SchemaToolsModule.SchemaTools();
		schemaTools.registerSchema(null, objSchema);

		schemaTools.parse();
		schemaTools.compile();

		var r = schemaTools.getSchema("uri://test/objSchema#");

		expect(r.compiled.properties.club).to.have.property('$objectLink');
		expect(r.compiled.properties.club.$objectLink).to.have.property('city');
		done();
	});

	it('[reg #7] id in properties', function(done) {
		var commonSchema = {
			"$schema": "http://json-schema.org/schema#",
			"id": "uri://registries/common#",
			"address": {
				"type": "object",
				"properties": {
					"id": {
						"type": "number"
					},
					"street": {
						"type": "string"
					},
				}
			},
			"user": {
				"id": "uri://registries/common#user",
				"type": "object",
				"properties": {
					"id": {
						"type": "number"
					},
					"firstName": {
						"type": "string"
					},
				}
			}
		};

		var schemaTools = new SchemaToolsModule.SchemaTools();
		schemaTools.registerSchema(null, commonSchema);

		schemaTools.parse();
		schemaTools.compile();

		expect(schemaTools.getSchema('uri://registries/common#user').compiled).to.exist;

		done();
	});

	/**
	 * $ref keyword should compile as referenced object. It should replace original object in which
	 * regerence is defined by referenced one.
	 */
	it('Keyword $ref', function(done) {

		var schema = {
			"$schema": "http://json-schema.org/schema#",
			"id": "uri://registries/common#",
			siblings: {
				properties: {
					$ref: 'uri://registries/common#person'
				}
			},
			"user": {
				"properties": {
					"firstName": {
						"type": "string"
					},
					"surName": {
						type: "number"
					},
					"address": {
						$ref: 'uri://registries/common#address'
					},
					occupation: {
						type: 'string',
						enum: {
							$ref: 'uri://registries/common#occupations'
						}
					},
					father: {
						$ref: 'uri://registries/common#person'
					},
					dummy: [
						{ $ref: 'uri://registries/common#address' },
						{ $ref: 'uri://registries/common#person' }
					]
				}
			},
			"address": {
				"properties": {
					"street": {
						"type": "string",
					},
					"city": {
						"type": "string"
					}
				}
			},
			occupations: [
				'player',
				'actor',
				'lumberjack'
			],
			person: {
				properties: {
					firstName: {
						type: "string"
					},
					surName: {
						type: "number"
					},
					address: {
						$ref: 'uri://registries/common#address'
					},

				}
			}
		};

		var schemaTools = new SchemaToolsModule.SchemaTools();
		schemaTools.registerSchema(null, schema);

		schemaTools.parse();
		schemaTools.compile();

		var userSchema = schemaTools.getSchema('uri://registries/common#');

		//console.log(require('util').inspect(userSchema, {depth: null}));
		expect(userSchema).to.exist;
		expect(userSchema.compiled.address.properties.street.type).to.be.equal('string');
		expect(userSchema.compiled.address.properties.city.type).to.be.equal('string');
		expect(userSchema.compiled.user.properties.address.properties.street.type).to.be.equal('string');
		expect(userSchema.compiled.user.properties.address.properties.city.type).to.be.equal('string');

		//array
		expect(userSchema.compiled.user.properties.occupation.enum).to.be.instanceof(Array);
		expect(userSchema.compiled.user.properties.occupation.enum).to.have.members(schema.occupations);

		// Negative cases

		var wrongSchemaRefNotOnlyProp = {
			"$schema": "http://json-schema.org/schema#",
			"id": "uri://registries/common#",
			fff: {
				properties: {
					name: {
						type: 'string',
					}
				}
			},
			ggg: {
				properties: {
					name: 'aa',
					$ref: 'uri://registries/common#fff'
				}
			},
		};

		schemaTools = new SchemaToolsModule.SchemaTools();
		schemaTools.registerSchema(null, wrongSchemaRefNotOnlyProp);

		schemaTools.parse();
		expect(function() {schemaTools.compile();}).to.throw(Error, /has to be only/);

		wrongSchemaRefNotOnlyProp = {
			"$schema": "http://json-schema.org/schema#",
			"id": "uri://registries/common#",
			ggg: {
				properties: {
					$ref: 'uri://registries/common#fff'
				}
			}
		};

		schemaTools = new SchemaToolsModule.SchemaTools();
		schemaTools.registerSchema(null, wrongSchemaRefNotOnlyProp);

		schemaTools.parse();
		expect(function() {schemaTools.compile();}).to.throw(Error, /schema not found/);

		done();
	});

	it('Keyword $ref nonexisting', function(done) {
		done();
	});
});
