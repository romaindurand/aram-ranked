import test from 'ava'
import User from '../lib/User'
let user

test.before('Creating user ...', async t => {
  user = await new User('euw', 'kupluss warwick')
})

test('constructor should throw if no username is provided', async t => {
  const failUser = await t.throws(new User('euw'))
  t.is(failUser.status, 'empty_username')
})

test('constructor should throw if no server is provided', async t => {
  const failUser = await t.throws(new User(undefined, 'kupluss warwick'))
  t.is(failUser.status, 'server_required')
})

test('user.getRanking', async t => {
  const userRanking = await user.getRanking()
  t.true(typeof userRanking === 'string')
  const parsedRanking = parseInt(userRanking, 10)
  t.false(isNaN(parsedRanking))
})

