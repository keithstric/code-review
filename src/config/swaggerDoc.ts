/**
 * This file sets up swagger-js and swagger-ui-express to
 * automatically generate swagger documentation and swagger.json. It also
 * sets up the reusable models for swagger.
 * For jsDoc structure visit:
 * - https://github.com/Surnet/swagger-jsdoc/blob/master/docs/GETTING-STARTED.md
 * - https://github.com/Surnet/swagger-jsdoc/tree/master/example/v2
 * - https://swagger.io/docs/specification/paths-and-operations/
 * - https://www.oodlestechnologies.com/blogs/Integrate-Swagger-in-your-NodeJS-Application/
 */
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { Application, Request, Response } from 'express';

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'code-review',
			version: '1.0.0',
			description: 'code-review api',
			contact: {
				name: 'Keith Strickland',
				email: 'keithstric@gmail.com'
			}
		},
		components: {
			schemas: {
				Branch: {
					allOf: [
						{
							'$ref': '#/components/schemas/Vertex'
						},{
							type: 'object',
							properties: {
								name: {
									type: 'string'
								}
							}
						}
					]
				},
				Error: {
					type: 'object',
					properties: {
						data: {
							type: 'object'
						},
						hasMore: {
							type: 'number'
						},
						id: {
							type: 'number'
						},
						message: {
							type: 'string'
						},
						name: {
							type: 'string'
						},
						previous: {
							type: 'array',
							items: {
								type: 'object'
							}
						},
						type: {
							type: 'string'
						}
					}
				},
				Log: {
					type: 'object',
					properties: {
						message: {
							type: 'string'
						},
						level: {
							type: 'string'
						},
						service: {
							type: 'string'
						},
						timestamp: {
							type: 'string'
						}
					}
				},
				Person: {
					allOf: [
						{
							'$ref': '#/components/schemas/Vertex'
						}, {
							type: 'object',
							properties: {
								first_name: {
									type: 'string'
								},
								last_name: {
									type: 'string'
								},
								email: {
									type: 'string'
								},
								password: {
									type: 'string'
								}
							}
						}
					]
				},
				Repository: {
					allOf: [
						{
							'$ref': '#/components/schemas/Vertex'
						},{
							type: 'object',
							properties: {
								url: {
									type: 'string'
								},
								name: {
									type: 'string'
								},
								path: {
									type: 'string'
								}
							}
						}
					]
				},
				Review: {
					allOf: [
						{
							'$ref': '#/components/schemas/Vertex'
						}, {
							type: 'object',
							properties: {
								status: {
									type: 'string'
								},
								repositoryId: {
									type: 'string'
								},
								repositoryUrl: {
									type: 'string'
								},
								repositoryName: {
									type: 'string'
								},
								branchId: {
									type: 'string'
								},
								branchName: {
									type: 'string'
								},
								requestor: {
									type: 'string'
								},
								reviewer: {
									type: 'string'
								},
								notes: {
									type: 'string'
								}
							}
						}
					]
				},
				Vertex: {
					type: 'object',
					properties: {
						_key: {
							type: 'string'
						},
						_id: {
							type: 'string'
						},
						_rev: {
							type: 'string'
						},
						created_date: {
							type: 'string'
						}
					}
				}
			},
			responses: {
				Branch: {
					description: 'A repository branch',
					content: {
						'application/json': {
							schema: {
								'$ref': '#/components/schemas/Branch'
							}
						}
					}
				},
				BranchArray: {
					description: 'Array of Branches',
					content: {
						'application/json': {
							schema: {
								type: 'array',
								items: {
									'$ref': '#/components/schemas/Branch'
								}
							}
						}
					}
				},
				Error: {
					description: 'Error Object',
					content: {
						'application/json': {
							schema: {
								'$ref': '#/components/schemas/Error'
							}
						}
					}
				},
				Message: {
					description: 'Message Object',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									message: {
										type: 'string'
									}
								}
							}
						}
					}
				},
				Person: {
					description: 'Person Object',
					content: {
						'application/json': {
							schema: {
								'$ref': '#/components/schemas/Person'
							}
						}
					}
				},
				PersonArray: {
					description: 'Array of people',
					content: {
						'application/json': {
							schema: {
								type: 'array',
								items: {
									'$ref': '#/components/schemas/Person'
								}
							}
						}
					}
				},
				Repository: {
					description: 'Repository Object',
					content: {
						'application/json': {
							schema: {
								'$ref': '#/components/schemas/Repository'
							}
						}
					}
				},
				RepositoryArray: {
					description: 'Array of Repositories',
					content: {
						'application/json': {
							schema: {
								type: 'array',
								items: {
									'$ref': '#/components/schemas/Repository'
								}
							}
						}
					}
				},
				Review: {
					description: 'Review Object',
					content: {
						'application/json': {
							schema: {
								'$ref': '#/components/schemas/Review'
							}
						}
					}
				},
				ReviewArray: {
					description: 'Array of Reviews',
					content: {
						'application/json': {
							schema: {
								type: 'array',
								items: {
									'$ref': '#/components/schemas/Review'
								}
							}
						}
					}
				},
				Vertex: {
					description: 'Vertex Object',
					content: {
						'application/json': {
							schema: {
								'$ref': '#/components/schemas/Vertex'
							}
						}
					}
				},
				VertexArray: {
					description: 'Array of vertices',
					content: {
						'application/json': {
							schema: {
								type: 'array',
								items: {
									'$ref': '#/components/schemas/Vertex'
								}
							}
						}
					}
				}
			},
			parameters: {
				startPosParam: {
					name: 'startPos',
					description: 'Starting position in the collection',
					in: 'query',
					schema: {
						type: 'integer'
					}
				},
				limitParam: {
					name: 'limit',
					description: 'How many records to return',
					in: 'query',
					schema: {
						type: 'integer'
					}
				},
				keyParam: {
					name: 'key',
					description: 'the key of a vertex or edge',
					in: 'path',
					schema: {
						type: 'string'
					}
				}
			}
		},
		tags: [
			{
				name: 'authentication',
				description: 'The registration and login routes'
			}, {
				name: 'people',
				description: 'People routes for people'
			}, {
				name: 'repositories',
				description: 'Routes for repositories'
			}, {
				name: 'reviews',
				description: 'Routes for reviews'
			}, {
				name: 'system',
				description: 'System routes for things like logging'
			}
		],
		basePath: '/'
	},
	apis: [
		'./dist/routes/api.js',
		'./dist/routes/auth.js',
		'./dist/routes/branch.js',
		'./dist/routes/people.js',
		'./dist/routes/repository.js',
		'./dist/routes/reviews.js',
	]
};

const swaggerOptions = {
	customCssUrl: '/theme-material.css'
}

const swaggerSpec = swaggerJsdoc(options);
const swaggerDocs = (app: Application) => {
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));
	app.get('/api-docs.json', (req: Request, res: Response) => {
		res.send(swaggerSpec);
	});
};

export default swaggerDocs;
