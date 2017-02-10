const AramRanked = require('./aram-ranked')
const euwClient = new AramRanked('euw')

logUser('kupluss warwick')

async function logUser (username) {
  const user = await euwClient.getUserByName(username)
  console.log(user)
}

// or with Promises

euwClient.getUserByName('kupluss warwick')
  .then(user => {
    console.log(user)
  })

// ouputs something like this, twice
// {
//   url: 'http://www.aram-ranked.info/euw/statistics/show?id=22767',
//   id: '22767',
//   lastGame: '02/10\n00:58',
//   refreshUrl: 'http://www.aram-ranked.info/euw/statistics/refresh?summoner_id=28912064',
//   rankingUrl: 'http://www.aram-ranked.info/euw/statistics/ranking?summoner_id=28912064',
//   summonerId: '28912064',
//   summonerIcon: 'http://www.aram-ranked.info/assets/profileicon/7-e8a6b068998d200e7c4ca3e9cfb4c0a600ed05a23e9a0955987f3f7b875d8034.png',
//   rating: '2537',
//   username: 'Kupluss Warwick',
//   isNew: false }
