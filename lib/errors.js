class AuthTokenNotFoundError extends Error {
  constructor () {
    super()
    this.message = 'Auth token was not found on this page.'
    this.status = 'auth_token_not_found'
  }
}
class EmptyUsernameError extends Error {
  constructor () {
    super()
    this.message = 'Empty user name ...'
    this.status = 'empty_username'
  }
}
class UserNotFoundError extends Error {
  constructor () {
    super()
    this.message = 'User was not found on this server.'
    this.status = 'user_not_found'
  }
}
class TotalUsersNotFoundError extends Error {
  constructor () {
    super()
    this.message = 'Total users count not found on this page.'
    this.status = 'total_users_not_found'
  }
}

module.exports = {AuthTokenNotFoundError, EmptyUsernameError, UserNotFoundError, TotalUsersNotFoundError}
