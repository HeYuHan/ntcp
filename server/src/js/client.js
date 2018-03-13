require("message_type.js");
require("server.js");
require("room.js");
var State={
    IN_NONE:0,
    IN_LOGIN:1,
    IN_LOBBY:2,
    IN_ROOM:3,
    IN_READY:4,
    IN_GAME:5,
    IN_BLANCE:6
}
Client.OnNewClient=function(uid){
    var client = Client.Get(uid);

    client.info={};
    client.state=State.IN_NONE;
    client.uid=uid;

    client.RegisterAllMessage();
}

Client.prototype.RegisterAllMessage=function(){
    this.m_MessageCallback=this.m_MessageCallback||{};
    this.m_MessageCallback[CLIENT_MSG.CM_LOGIN]=this.Login;
    this.m_MessageCallback[CLIENT_MSG.CM_CREATE_ROOM]=this.CreateRoom;
    this.m_MessageCallback[CLIENT_MSG.CM_ENTER_ROOM]=this.EnterRoom;
    this.m_MessageCallback[CLIENT_MSG.CM_LEAVE_ROOM]=this.LeaveRoom;
    this.m_MessageCallback[CLIENT_MSG.CM_READY_GAME]=this.ReadyGame;
    this.m_MessageCallback[CLIENT_MSG.CM_CHU_PAI]=this.ChuPai;
    this.m_MessageCallback[CLIENT_MSG.CM_RESPON_CHU_PAI]=this.ResponseChuPai;
    this.m_MessageCallback[CLIENT_MSG.CM_HUAN_PAI]=this.HuanPai;
}
Client.prototype.UnRegisterMessage=function(id){
    this.m_MessageCallback[id]=null;
}
Client.prototype.RegisterMessage=function(id,call_back){
    this.m_MessageCallback[id]=call_back;
}
Client.prototype.OnConnected=function(){
    Debug.Log("OnConnected:"+this.uid);
    this.state=State.IN_LOGIN;
    
}
Client.prototype.OnDisconected=function(){
    Debug.Log("OnDisconected:"+this.uid);
    this.uid=0;
    this.info=null;
    this.state=State.IN_NONE;
    this.room=null;
    this.player=null;
}
Client.prototype.OnMessage=function(msg){
    Debug.Log(msg);
    this.DispatchMessage(JSON.parse(msg));
    // try
    // {
        
    // }catch(e)
    // {
    //     Debug.Log("DispatchMessage:"+e.message);
    // }
    
    
}
Client.prototype.DispatchMessage=function(msg){
    var hander=this.m_MessageCallback[msg.id];
    if(hander)hander.call(this,msg.msg);
    else
    {
        Debug.Log("msg hander is null id : "+msg.id);
    }
}
Client.prototype.Login=function(msg){
    var msg={
        uid:this.uid
    }
    this.state=State.IN_LOBBY;
    this.Send(CreateMsg(SERVER_MSG.SM_LOGIN,msg));
}
Client.prototype.CreateRoom=function(msg){
    var room=Room.Create();
    this.Send(CreateMsg(SERVER_MSG.SM_CREATE_ROOM,{
        room_uid:room.uid,
        self:msg.self
    }));
}
Client.prototype.EnterRoom=function(msg){
    Debug.Log("EnterRoom:"+this.uid);
    var room_uid=msg.room_uid;
    var room=Room.Get(room_uid);
    if(room){
        this.state=State.IN_ROOM;
        this.room=room;
        room.ClientJoin(this);
        
    }
    else
    {
        this.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM,{
            error:"room not found:"+room_uid
        }));
    }
}
Client.prototype.LeaveRoom=function(msg){
    if(this.room)room.ClientLeave(this);
    this.room=null;
}
Client.prototype.ReadyGame=function(msg){
    this.state=msg.state;
    this.room.ClientReady(this,this.state);
}
Client.prototype.Ready=function(){
    return (this.state == State.IN_READY);
}
Client.prototype.ChuPai=function(msg){
    this.room.ClientChuPai(this,msg);
}
Client.prototype.ResponseChuPai=function(msg){
    this.room.ClientResponseChuPai(this,msg);
}
Client.prototype.HuanPai=function(msg){
    this.room.ClientHuanPai(this,msg);
}