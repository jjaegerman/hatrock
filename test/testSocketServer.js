var net = require('net');
var server = net.createServer();    
server.on('connection', handleConnection);
server.listen(9055, function() {    
    console.log('server listening to %j', server.address());  
});

mockData = `E2806894000040286A722C56        05:16:55.386 PM         -53     1
E2806894000040286A722C53        05:16:55.400 PM         -54     1
E2806894000040286A722C55        05:16:55.431 PM         -56     1`

function handleConnection(conn) {    
    var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;  
    console.log('new client connection from %s', remoteAddress);
    conn.on('data', onConnData);  
    conn.once('close', onConnClose);  
    conn.on('error', onConnError);
    function onConnData(d) {  
        console.log('connection data from %s: %j', remoteAddress, d);  
        conn.write(d);  
    }
    function onConnClose() {  
        console.log('connection from %s closed', remoteAddress);  
    }
    function onConnError(err) {  
        console.log('Connection %s error: %s', remoteAddress, err.message);  
    } 
    conn.write('test')

    setInterval(()=>conn.write(mockData),1000)
}