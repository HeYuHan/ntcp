
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
    private requestCreateRoom:boolean=false;
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
        if(!this.native)
        {
            LogError("native client is null");
            return;
        }
        var nstring=new NString();
        nstring.Append(msg);
        this.SendNString(nstring);
    }
    public SendNString(msg:NString){
        this.native.Send(msg.Get());
        msg.Append("\n");
        if(this.room && this.room.recoder_stream)this.room.recoder_stream.Write(msg.Get());
    }
    public CloseOnSendEnd(){
        if(this.native)this.native.CloseOnSendEnd();
    }
    public CloseTimeOut(time:number)
    {
        gServer.AddTask(new Task(this,this,function(sender:Client,arg){
            sender.Disconnect();
        },time));
         
    }
    private OnMessage(msg:string){
        
        try
        {
            var json=JSON.parse(msg);
            this.DispatchMessage(json);
        }
        catch(e){
            LogInfo(msg);
            PrintError("parse message error:",e);
            this.native.Disconnect();
        }
    }
    private OnConnected(){
        this.state=State.IN_LOGIN;
        this.requestCreateRoom=false;
        this.RegisterAllMessage();
    }
    private OnDisconected(){
        this.LeaveRoom();
        this.native=null;
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
        this.m_MessageCallback[CLIENT_MSG.CM_MAI_ZHUANG]=this.MaiZhuang;
        this.m_MessageCallback[CLIENT_MSG.CM_BROADCAST]=this.Broadcast;
        this.m_MessageCallback[CLIENT_MSG.CM_DISMISS_GAME]=this.GameLeave;
        this.m_MessageCallback[CLIENT_MSG.CM_CHECK_IN_ROOM]=this.CheckInRoom;
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
    public Disconnect()
    {
        if(this.native)this.native.Disconnect();
    }
    public CheckUserState(unionid,roomid,call_back)
    {
        var uid = Room.CheckRoomEnter(roomid,unionid);
        if(uid === null)call_back({});
        else call_back({
            error:"ERROR_USER_STATE_INROOM",
            msg:uid
        });
    }
    public EnterRoom(msg){
        if(this.room){
            this.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM,{
                error:"is in room roomid:"+this.room.uid
            }));
            return;
        }
        var roomid=msg.roomid;
        var unionid=msg.unionid;
        this.info=msg;
        if(!unionid || !roomid){
            this.native.Disconnect();
            return;
        }
        if(this.requestCreateRoom)return;
        var client=this;
        this.CheckUserState(unionid,roomid,function(result){
            if(result.error)
            {
                client.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM,result));
                return;
            }
            var room=Room.Get(roomid);
            if(room){
                client.state=State.IN_ROOM;
                client.room=room;
                var ret = room.ClientJoin(client);
                if(ret != null)
                {
                    client.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM,{
                        error:ret
                    }));
                    return;
                }
            }
            else
            {
               
                PostJson(INFO_SERVER_URL + "getRoomCard",{
                    token:INFO_ACCESS_TOKEN,
                    roomid:roomid
                },function(state,cardinfo){
                    client.requestCreateRoom=false;
                    var json = JSON.parse(cardinfo);
                    if(state == 200 && !json.error){
                        if(client.native == null)
                        {
                            LogError("on create room but client is disconnect!!!");
                            return;
                        }
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
                        client.native.Disconnect();
                    }
                });
            }
        });

    }
    public CheckInRoom(msg){
        this.Send(CreateMsg(SERVER_MSG.SM_CHECK_IN_ROOM,{roomid:Room.CheckRoomEnter(msg.roomid,msg.unionid)}));
    }
    public LeaveRoom(){
        if(this.room)this.room.ClientLeave(this);
        this.room=null;
    }
    public ReadyGame(msg){
        this.state=msg.state;
        this.room.ClientReady(this,this.state);
    }
    public SetReplayState(){
        this.state=State.IN_ROOM;
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
    public MaiZhuang(msg){
        this.room.ClientMaiZhuang(this,msg);
    }
    public Broadcast(msg)
    {
        if(this.room)this.room.ClientBroadcast(this,msg);
    }
    public GameLeave(msg)
    {
        if(this.room)this.room.GameLeave(this,msg.dismiss);
    }
}