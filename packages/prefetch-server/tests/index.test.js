const express = require('express');
const app = express();
const port = 3000;

async function startServer(){
  const middleware = require('../dist/index.js');
  console.log('middleware', middleware)
  await middleware(app)
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}
startServer()
