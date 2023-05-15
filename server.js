const express = require('express');
const app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('.'));

// http://expressjs.com/en/starter/basic-routing.htmls
app.get('/', function(request, response) {
  response.sendFile('index.html');
});

// listen for requests :)
const listener = app.listen('6060', function() {
  console.log('Your app is listening on port ' + listener.address().port);
});



// const Websocket = require('ws');
// const wss = Websocket.Server({port: 3000});


