
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
        this.native.Send(msg);
    }
    public SendNString(msg:NString){
        this.native.SendNString(msg);
    }
    private OnMessage(msg:string){
        var json=JSON.parse(msg);
        Debug.Log(CLIENT_MSG[json[0]]+":"+JSON.stringify(json[1]));
        this.DispatchMessage(json);
    }
    private OnConnected(){
        Debug.Log("OnConnected:"+this.uid);
        this.state=State.IN_LOGIN;
        this.RegisterAllMessage();
    }
    private OnDisconected(){
        Debug.Log("OnDisconected:"+this.uid);
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
            Debug.Log("msg hander is null id : "+msg.id);
        }
    }
    public EnterRoom(msg){
        Debug.Log("EnterRoom:"+this.uid+" room_id:"+msg.room_uid);
        var room_uid=msg.room_uid;
        var room=Room.Get(room_uid);
        if(room){
            this.state=State.IN_ROOM;
            this.room=room;
            room.ClientJoin(this);
            
        }
        else
        {
            var http = new Http();
            var client=this;
            http.OnResponse=function(state,msg){
                Debug.Log("check room ret:"+msg);
                var json = JSON.parse(msg);
                if(state == 200 && !json.error){
                    var room = Room.Create(json);
                    client.state=State.IN_ROOM;
                    client.room=room;
                    room.ClientJoin(client);
                }
                else{
                    this.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM,{
                        error:"room not found:"+room_uid
                    }));
                }
            }
            http.Get(INFO_SERVER_URL + "checkRoom?data="+EncodeUriMsg({roomid:room_uid}));
            
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
        this.room.ClientChuPai(this,msg);
    }
    public ResponseChuPai(msg){
        this.room.ClientResponseChuPai(this,msg);
    }
    public HuanPai(msg){
        this.room.ClientHuanPai(this,msg);
    }
}