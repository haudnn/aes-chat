var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser')
const NodeRSA = require('node-rsa');
app.use(bodyParser.json({extended: true, limit: '30mb'}))
app.use(bodyParser.urlencoded({ extended: true, limit:'30mb' }))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get("/key", function (req, res, next) {
  let key = new NodeRSA({ b: 1024});
  const pubicKey = key.exportKey("public")
  const privateKey = key.exportKey("private")
  res.status(200).json({
    pubicKey,
    privateKey
  })
})
app.post("/enc", function (req, res, next) {
  const {text , publicKey} = req.body
  let key_public = new NodeRSA(publicKey)
  const encString = key_public.encrypt(text , "base64")
  io.emit('chat message', encString);
})

app.post("/dec", function (req, res, next) {
  const {text , privateKey} = req.body
  let key_private = new NodeRSA(privateKey)
  const decString = key_private.decrypt(text , "utf8")
  res.status(200).json({
    status: "success",
    msg : decString
  })
})
io.on('connection', function (socket) {
  socket.on('chat message', function (msg) {
    io.emit('chat message', msg);
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
