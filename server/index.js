import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'

const PORT = 3000
createServer(async (request, response) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
  }

  if(request.method === 'OPTIONS') {
    response.writeHead(204, headers)
    response.end()
    return
  }

  createReadStream('./animeflv.csv') // reads file
  .pipe(response) // returns read response

  response.writeHead(200, headers)
})
.listen(PORT)
.on('listening', _ => console.log(`server is running at ${PORT}`))