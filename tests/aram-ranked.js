import test from 'ava'
import AramRanked from '../aram-ranked'
let aramRanked, user

test.before('Creating euw aram-ranked client', t => {
  aramRanked = new AramRanked('euw')
})

test.serial('aramRanked.getUserByName', async t => {
  user = await aramRanked.getUserByName('kupluss warwick')
  t.is(user.isNew, false)
})

test('AramRanked.getServers (static)', t => {
  const servers = AramRanked.getServers()
  Object.keys(servers).forEach((server) => {
    t.truthy(typeof servers[server] === 'string')
  })
  t.truthy(typeof servers === 'object')
})

test('aramRanked.getTotalUsers', async t => {
  const totalUsers = await aramRanked.getTotalUsers()
  t.true(typeof totalUsers === 'string')
  const parsedTotal = parseInt(totalUsers, 10)
  t.false(isNaN(parsedTotal))
})

test('constructor should throw with no server provided', async t => {
  await t.throws(() => new AramRanked())
})
