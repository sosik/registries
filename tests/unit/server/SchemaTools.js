var expect = require('chai').expect;

describe('SchemaTools', function() {
	var SchemaToolsModule = require(process.cwd() + '/build/server/SchemaTools.js');

	it('Simple schema registration and retriaval', function(done) {
		var simpleSchema1 = {
			"id": "uri://registries/simpleSchema1#"
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
		expect(r.compiled.properties.club.properties).to.have.property('registry');
		expect(r.compiled.properties.club.properties).to.have.property('oid');
		done();
	});
});
