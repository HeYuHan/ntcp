
enum State{
    IN_NONE=0,
    IN_LOGIN,
    IN_LOBBY,
    IN_ROOM,
    IN_READY,
    IN_GAME,
    IN_BLANCE
}
class JClient{
    public state:number=State.IN_NONE;
    private m_MessageCallback:{[key:number]:(msg:string)=>void;}
    public uid:number;
    private native:Client;
    public player:RoomPlayer;
    public room:Room;
    public info:any={};
    constructor(uid:number){
        
        this.native=Client.Get(uid);
        if(!this.native)return null;
        this.uid=uid;
        var self=this;
        this.native.OnMessage=(msg)=>{self.OnMessage(msg)}
        this.native.OnConnected=()=>{self.OnConnected()}
        this.native.OnDisconected=()=>{self.OnDisconected()}
    }
    public Send(msg:string){
        var nstring=new NString();
        nstring.Append(msg);
        this.SendNString(nstring);
    }
    public SendNString(msg:NString){
        this.native.SendNString(msg);
        msg.Append("\n");
        if(this.room && this.room.recoder_stream)this.room.recoder_stream.WriteNString(msg);
    }
    private OnMessage(msg:string){
        var json=JSON.parse(msg);
        LogInfo(CLIENT_MSG[json[0]]+":"+JSON.stringify(json[1]));
        try
        {
            
            this.DispatchMessage(json);
        }
        catch(e){
            PrintError("parse message error:",e);
            this.native.Disconnect();
        }
    }
    private OnConnected(){
        LogInfo("OnConnected:"+this.uid);
        this.state=State.IN_LOGIN;
        this.RegisterAllMessage();
    }
    private OnDisconected(){
        LogInfo("OnDisconected:"+this.uid);
        try
        {
            this.LeaveRoom(null);
        }
        catch(e){
            PrintError("leave room error:",e);
        }
        
        this.uid=0;
        this.info=null;
        this.state=State.IN_NONE;
        this.room=null;
        this.player=null;
    }
    public RegisterAllMessage(){
        this.m_MessageCallback={};
        this.m_MessageCallback[CLIENT_MSG.CM_ENTER_ROOM]=this.EnterRoom;
        this.m_MessageCallback[CLIENT_MSG.CM_LEAVE_ROOM]=this.LeaveRoom;
        this.m_MessageCallback[CLIENT_MSG.CM_READY_GAME]=this.ReadyGame;
        this.m_MessageCallback[CLIENT_MSG.CM_CHU_PAI]=this.ChuPai;
        this.m_MessageCallback[CLIENT_MSG.CM_RESPON_CHU_PAI]=this.ResponseChuPai;
        this.m_MessageCallback[CLIENT_MSG.CM_HUAN_PAI]=this.HuanPai;
    }
    private DispatchMessage(msg){
        var hander=this.m_MessageCallback[msg[0]];
        if(hander)hander.call(this,msg[1]);
        else
        {
            LogError("msg hander is null id : "+msg.id);
            this.native.Disconnect();
        }
    }
    public EnterRoom(msg){
        var roomid=msg.roomid;
        var unionid=msg.unionid;
        this.info=msg;
        if(!unionid || !roomid){
            this.native.Disconnect();
            return;
        }
        var client=this;
        var room=Room.Get(roomid);
        if(room){
            client.state=State.IN_ROOM;
            client.room=room;
            room.ClientJoin(client);
        }
        else
        {
            PostJson(INFO_SERVER_URL + "getRoomCard",{
                token:INFO_ACCESS_TOKEN,
                roomid:roomid
            },function(state,msg){
                LogInfo("getRoomCard:"+msg);
                var json = JSON.parse(msg);
                if(state == 200 && !json.error){
                    var room_card:RoomCard=json;
                    if(room_card.canUseCount <= 0){
                        client.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM,{
                            error:"room card is used"
                        }));
                        return;
                    }
                    var room = Room.Create(roomid,room_card);
                    client.state=State.IN_ROOM;
                    client.room=room;
                    room.ClientJoin(client);
                }
                else{
                    client.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM,{
                        error:"room not found:"+roomid
                    }));
                    //client.native.Disconnect();
                }
            });
        }

    }
    public LeaveRoom(msg){
        if(this.room)this.room.ClientLeave(this);
        this.room=null;
    }
    public ReadyGame(msg){
        this.state=msg.state;
        this.room.ClientReady(this,this.state);
    }
    public Ready():boolean{
        return (this.state == State.IN_READY);
    }
    public ChuPai(msg){
        this.room.ClientChuPai(this.player,msg);
    }
    public ResponseChuPai(msg){
        this.room.ClientResponseChuPai(this,msg);
    }
    public HuanPai(msg){
        this.room.ClientHuanPai(this,msg);
    }
}