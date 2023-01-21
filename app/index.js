const API_URL = 'http://localhost:3000'

async function consumeAPI(signal) {
  const response = await fetch(API_URL, {
    signal
  })
  let counter = 0
  const reader = response.body
    .pipeThrough(new TextDecoderStream())
    .pipeTo(new WritableStream({
      write(chunk) {
        console.log(++counter, 'chunk', chunk)
      }
    }))

    return reader
}

const abortController = new AbortController()
await consumeAPI(abortController.signal)