const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team;`
  const playersArray = await db.all(getPlayersQuery)

  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.get('/players/:player_id/', async (request, response) => {
  const {player_id} = request.params
  const getPlayerQuery = `
  SELECT * FROM cricket_team WHERE player_id=${player_id};
  `
  const playersArray = await db.get(getPlayerQuery)
  response.send(convertDbObjectToResponseObject(playersArray))
})

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const addPlayerQuery = `
    INSERT INTO
      cricket_team (player_name,jersey_number,role)
    VALUES
      (
        '${playerName}',
        ${jerseyNumber},
        '${role}'
      );`
  const player = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

app.put('/players/:player_id/', async (request, response) => {
  const {player_id} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerQuery = `
    UPDATE 
      cricket_team
    SET
      player_name='${playerName}',
      jersey_number=${jerseyNumber},
      role='${role}'
    WHERE
      player_id=${player_id}`

  await db.run(updatePlayerQuery)
  response.send(`Player Details Updated`)
})

app.delete('/players/:player_id/', async (request, response) => {
  const {player_id} = request.params
  const getPlayerQuery = `
  DELETE FROM
    cricket_team
  WHERE
    player_id = ${player_id};`
  await db.run(getPlayerQuery)
  response.send('Player Removed')
})
module.exports = app
