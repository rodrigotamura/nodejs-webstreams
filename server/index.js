import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { Readable, Transform } from 'node:stream' // handling data as datasource
import { WritableStream, TransformStream } from 'node:stream/web' 
import csvtojson from 'csvtojson'

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

  let items = 0
  Readable.toWeb(createReadStream('./animeflv.csv')) // it makes compatioble with a browser
  // pipeThrough - for step by step of each item traveling
  // remembering that whne we use stream we are working line by line and releasing memory
  .pipeThrough(Transform.toWeb(csvtojson())) // converting to json
  // pipeTo - for latest step
  .pipeTo(new WritableStream({ // data output
    write(chunk) {
      items++
      response.write(chunk)
    },
    close() {
      response.end() // ends request
    }
  }))

  response.writeHead(200, headers)
})
.listen(PORT)
.on('listening', _ => console.log(`server is running at ${PORT}`))