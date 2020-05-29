export enum ApiMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

/**
 * Not sure if this is really a good idea. There could be a lot of endpoints and this
 * doesn't take into account endpoint patterns ('/api/something/:id')
 */
export enum ApiEndpoints {
  LOGIN = '/api/auth/login',
  REGISTER = '/api/auth/register',
  LOGOUT = '/api/auth/logout',
  REPOSITORIES = '/api/repositories',
  REVIEWS = '/api/reviews',
  PEOPLE = '/api/people'
}
