import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { Readable, Transform } from 'node:stream' // handling data as datasource
import { WritableStream, TransformStream } from 'node:stream/web'
import { setTimeout } from 'node:timers/promises' // async setTimeout
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

  // when connections is suddenly closed
  request.once('close', _ => console.log(`connection was closed!`, items))

  Readable.toWeb(createReadStream('./animeflv.csv')) // it makes compatioble with a browser
  // pipeThrough - for step by step of each item traveling
  // remembering that whne we use stream we are working line by line and releasing memory
  .pipeThrough(Transform.toWeb(csvtojson())) // converting to json
  .pipeThrough(new TransformStream({
    transform(chunk, controller) {
      const data = JSON.parse(Buffer.from(chunk))
      const mappedData = {
        title: data.title,
        description: data.description,
        url_anime: data.url_anime
      }
      // wrapping because it is NDJSON
      controller.enqueue(JSON.stringify(mappedData).concat('\n'))
    }
  })) // mapping json for Nodejs handling
  // pipeTo - for latest step
  .pipeTo(new WritableStream({ // data output
    async write(chunk) {
      await setTimeout(200)
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