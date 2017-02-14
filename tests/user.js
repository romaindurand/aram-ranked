import test from 'ava'
import {User} from '../aram-ranked'

test('constructor should throw if no username is provided', async t => {
  const failUser = await t.throws(new User('euw'))
  t.is(failUser.status, 'empty_username')
})

test('constructor should throw if no server is provided', async t => {
  const failUser = await t.throws(new User(undefined, 'kupluss warwick'))
  t.is(failUser.status, 'server_required')
})
