//requrindo express lib
var express = require('express');
//instanciando express
var app = express();
//criando o server http
var server = require('http').createServer(app);
//criando o socket e escutanto no server
var io = require('socket.io').listen(server);
//vairiaveis globais
users = [];
connections = [];

//escutanto na porta 3000
server.listen(process.env.PORT || 3000);
console.log('server running...');

//declarando a pasta para recursos estáticos
app.use("/", express.static(__dirname + '/'));

//route main
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});


/*
    socket
*/
io.sockets.on('connection', function(socket){
    connections.push(socket);
    console.log('Connected: %s sockets connected',connections.length);

    //Disconnect
    socket.on('disconnect', function(data){
    	users.splice(users.indexOf(socket.username,1));
    	updateUsernames();
    	connections.splice(connections.indexOf(socket),1);
    	console.log('Disconnect: %s sockets connected',connections.length);
    });

    //send menssage
    socket.on('send message', function(data){
    	console.log(data);
    	io.sockets.emit('new message',{msg:data,username:socket.username,color:socket.color});
    });


    //new user
    socket.on('new user',function(data,callback){
    	callback(true);
    	socket.username = data.user;
    	socket.color = data.color;
    	users.push(socket.username);
    	updateUsernames();
    });

    //atualizar o array dos usur logados
    function updateUsernames(){
    	io.sockets.emit('get users',users)
    }

    //enviar o emoji pros sockets
    socket.on('send emoji',function(data){
        io.sockets.emit('new emoji',data);
    });
});
