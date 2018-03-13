require("client.js");

Server.prototype.OnAccept=function(uid){
    Client.OnNewClient(uid);
    
}
var gServer=Server.Get();