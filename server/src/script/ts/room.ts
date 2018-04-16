



enum PaiMessageResponse{
    RESULT_NONE=0,
    RESULT_PENG,//碰牌
    RESULT_GANG,//杠牌
    RESULT_HU,//胡牌
    RESULT_XI,//喜牌
    RESULT_ANGANG,//暗杆
}

class RoomPlayer{
    //牌桌上的位置
    public index:number=0;
    //手牌
    public shou_pai:Array<number>=[];
    //底牌 碰,杠,喜
    public di_pai:Array<number>=[];
    //弃牌
    public qi_pai:Array<number>=[];

    public client:JClient;
    public uid:number;

    public openid:string;
    //天听
    public tian_ting:boolean=true;
    //天胡
    public tian_hu:boolean =false;
    //叫牌
    public jiao_pai_array:Array<number>=[];
    //按杠的牌
    public an_gang_array:Array<Pai>=[];
    //胡牌信息
    public hu_pai_info:HuPaiInfo=null;
    //是否胡牌
    public hui_pai:boolean=false;
    //胡的谁的牌
    public hui_pai_uid:number=0;
    //每回合回复的消息
    public result_msg:any=null;
    
    public AddDiPais(pais){
        if(typeof(pais) == "number"){
            this.di_pai.push(pais);
        }
        for(var i = 0;i<pais.length;i++)
        {
            this.di_pai.push(pais[i]);
        }
    }

    public AddQiPais(pais){
        if(typeof(pais) == "number"){
            this.qi_pai.push(pais);
        }
        for(var i = 0;i<pais.length;i++)
        {
            this.qi_pai.push(pais[i]);
        }
    }
    public SetPlayerInfo(client:JClient,openid:string){
        this.uid=client.uid;
        this.client=client;
        this.openid=openid;
        client.player=this;
        client.state=State.IN_GAME;
    }
    // public HavePai(value:number):boolean{
    //     return  this.shou_pai.indexOf(value) >= 0;
    // }
    public SortPai(){
        this.shou_pai.sort();
    }
    public MoPai(pai:number){
        this.shou_pai.push(pai);
    }
    public ChuPai(value:number):boolean{
        var index=this.shou_pai.indexOf(value);
        if(index>=0)
        {
            this.shou_pai.splice(index,1);
            return true;
        }
        return false;
    }
    public GetShouPaiSize():number{
        return this.shou_pai.length;
    }
    public PrintShouPai(){
        var msg="";
        for(var i=0;i<this.shou_pai.length;i++){
            msg+=(this.shou_pai[i]+",");
        }
        LogInfo("palyer index:"+this.index+" shou pai:"+msg);
    }
    public Peng(value:number):boolean{
        var temp_shou=[];
        var temp_di=[];
        for(var i=0;i<this.shou_pai.length;i++)
        {
            var pai = this.shou_pai[i];
            if(temp_di.length<2 && Pai.Equal(pai,value))
            {
                temp_di.push(pai);
            }
            else
            {
                temp_shou.push(pai);
            }
        }
        //LogInfo(temp_di);
        if(temp_di.length>1)
        {
            temp_di.push(value);
            this.AddDiPais(temp_di);
            this.shou_pai=temp_shou;
            return true;
        }
        return false;
    }
    public AnGang(value:number):boolean{
        this.shou_pai.sort(Pai.SortNumber);
        var first_gan_index=-1;
        for(var i=0;i<this.shou_pai.length-3;i++)
        {
            if(Pai.Equal(this.shou_pai[i],this.shou_pai[i+1])&&Pai.Equal(this.shou_pai[i+1],this.shou_pai[i+2])&&Pai.Equal(this.shou_pai[i+2],this.shou_pai[i+3]))
            {
                if(Pai.Equal(this.shou_pai[i],value)||Pai.Equal(this.shou_pai[i+1],value)||Pai.Equal(this.shou_pai[i+2],value)||Pai.Equal(this.shou_pai[i+3],value))
                {
                    this.AddDiPais([this.shou_pai[i],this.shou_pai[i+1],this.shou_pai[i+2],this.shou_pai[i+3]]);
                    
                    this.an_gang_array.push(Pai.GetPaiByNumber(this.shou_pai[i]));
                    this.shou_pai.splice(i,4);
                    return true;
                }
                else if(first_gan_index == -1){
                    first_gan_index=i;
                }
            }
        }
        if(first_gan_index!=-1){
            this.an_gang_array.push(Pai.GetPaiByNumber(this.shou_pai[first_gan_index]));
            this.AddDiPais([this.shou_pai[first_gan_index],this.shou_pai[first_gan_index+1],this.shou_pai[first_gan_index+2],this.shou_pai[first_gan_index+3]]);
            this.shou_pai.splice(first_gan_index,4);
            
            return true;
        }
        return false;
    }
    public Gang(value:number):boolean{
        var temp_shou=[];
        var temp_di=[];
        for(var i=0;i<this.shou_pai.length;i++)
        {
            var pai = this.shou_pai[i];
            if(temp_di.length<3 && Pai.Equal(pai,value))
            {
                temp_di.push(pai);
            }
            else
            {
                temp_shou.push(pai);
            }
        }
        if(temp_di.length>2)
        {
            temp_di.push(value);
            this.AddDiPais(temp_di);
            this.shou_pai=temp_shou;
            return true;
        }
        for(var i=0;i<this.di_pai.length;i++)
        {
            var pai = this.di_pai[i];
            if(Pai.Equal(pai,value))
            {
                var index=this.shou_pai.indexOf(value);
                if(index>=0){
                    this.shou_pai.splice(index,1);
                    this.di_pai.push(value);
                    return true;
                }
                return false;
            }
        }
        return false;
    }
    public CaculateHu(pais:PaiDui){
        this.hui_pai=false;
        //this.shou_pai.sort(Pai.SortNumber);
        this.di_pai.sort(Pai.SortNumber);
        this.hu_pai_info = pais.CaculateDiHu(this.shou_pai,this.di_pai,this.an_gang_array,this.jiao_pai_array);
        this.hu_pai_info.CaculateTotleScore(null);
    }
    public Hu(pai:number,pais:PaiDui):boolean{
        var ret =false;
        var caulater= new CheckPaiNode();
        for(var i=0;i<this.shou_pai.length;i++){
            caulater.AddOriginPai(pais.GetPaiDetail(this.shou_pai[i]));
        }
        caulater.AddOriginPai(pais.GetPaiDetail(pai));
        var result_array = caulater.CheckWin();
        this.hu_pai_info=null;
        this.hui_pai=false;
        ret = result_array != null;
        if(ret){
            this.hui_pai=true;
            var di_info_array:Array<HuPaiInfo>=[];
            this.di_pai.sort(PaiDui.SortPaiArray);
            for(var i=0;i<result_array.length;i++){
                var shou=Pai.DetailToNumberArray(result_array[i]);
                var info = pais.CaculateDiHu(shou,this.di_pai,this.an_gang_array,this.jiao_pai_array);
                info.hu_pai_array=shou;
                if(this.tian_ting){
                    info.hu_pai_type |= HuPaiType.TIANG_TING;
                }
                info.CaculateTotleScore(pais.GetPaiDetail(pai));
                di_info_array.push(info);
            }
            this.hu_pai_info=di_info_array[0];
            for(var i=1;i<di_info_array.length;i++){
                if(this.hu_pai_info.totle_socre < di_info_array[i].totle_socre){
                    this.hu_pai_info = di_info_array[i];
                }
            }
        }
        return ret;
    }
    public ZiMo(pai:PaiDetail,pais:PaiDui):boolean{
        var ret =false;
        var caulater= new CheckPaiNode();
        for(var i=0;i<this.shou_pai.length;i++){
            caulater.AddOriginPai(pais.GetPaiDetail(this.shou_pai[i]));
        }
        
        var result_array = caulater.CheckWin();
        this.hu_pai_info=null;
        this.hui_pai=false;
        ret = result_array.length>0;
        if(ret){
            // for(var i=0;i<result_array.length;i++){
            //     LogInfo(Pai.PrintDetailArray(result_array[i]));
            // }
            //天胡
            this.tian_hu = pais.GetSize() == (pais.GetMaxSize()-22*ROOM_MAX_PLAYER_COUNT-3);
            LogInfo("tian hu:"+this.tian_hu+" pais.GetSize()"+pais.GetSize());
            this.hui_pai=true;
            var di_info_array:Array<HuPaiInfo>=[];
            for(var i=0;i<result_array.length;i++){
                var shou=Pai.DetailToNumberArray(result_array[i]);
                var info = pais.CaculateDiHu(shou,this.di_pai,this.an_gang_array,this.jiao_pai_array);
                info.hu_pai_array=shou;
                info.hu_pai_type |= HuPaiType.ZI_MO;
                //天胡
                if(this.tian_hu){
                    info.hu_pai_type |=HuPaiType.TIANG_HU;
                }
                info.CaculateTotleScore(pai);
                di_info_array.push(info);
            }
            this.hu_pai_info=di_info_array[0];
            for(var i=1;i<di_info_array.length;i++){
                if(this.hu_pai_info.totle_socre < di_info_array[i].totle_socre){
                    this.hu_pai_info = di_info_array[i];
                }
            }
        }

        return ret;
    }
}
enum RoomState{
    IN_NONE=0,
    IN_WAIT,
    IN_PLAY,
    IN_BLANCE,
    IN_END
}
class Room{
    private m_timer:Timer=null;
    public uid:number;
    public info:any=null;
    public state:RoomState=RoomState.IN_NONE;
    public room_players:Array<RoomPlayer>=[];
    public pais:PaiDui=null;
    private m_clients:Array<JClient>=[];
    private next_mo_palyer:number=0;
    private next_chu_palyer:number=0;
    private wait_result_players:Array<RoomPlayer>=[];
    private players_result_msg_count=0;
    private wait_result:boolean=false;
    private last_chu_pai:number=0;
    private last_mo_pai:number=0;
    //最后出牌的玩家
    private last_chu_pai_player:RoomPlayer=null;
    //最后摸牌的玩家
    private last_mo_pai_player:RoomPlayer=null;
    //自动出牌记时
    public auto_chu_pai_timer:number=0;
    //记录写入流
    public recoder_stream:AsyncFileWriter=null;
    private static gRoomList:Array<Room>=[];
    public static Create(info:any):Room{
        var room = Room.Get(info.roomid);
        if(room){
            return room;
        }
        room = new Room();
        room.uid=info.roomid;
        room.info=info;
        Room.gRoomList.push(room);
        return room;
    }
    public static Get(uid:number){
        for(var i=0;i<Room.gRoomList.length;i++)
        {
            
            var room=Room.gRoomList[i];
            if(room.uid==uid)return room;
        }
        return null;
    }
    public static Remove(uid:number){
        for(var i=0;i<Room.gRoomList.length;i++)
        {
            var room=Room.gRoomList[i];
            if(room.uid==uid)
            {
                Room.gRoomList.splice(i,1);
                return;
            }
        }
    }
    public AddClient(client:JClient){
        this.m_clients.push(client);
    }
    public RemoveClient(c){
        var index=this.m_clients.indexOf(c);
        if(index>=0){
            this.m_clients.splice(index,1);
            return true;
        }
        return false;
    }
    public Init(){
        var self=this;
        this.m_timer.OnUpdate=(t)=>{self.OnUpdate(t)}
        this.m_timer.Begin();
    }
    public OnUpdate(t:number){
        this.auto_chu_pai_timer+=t;
        if(this.auto_chu_pai_timer>AUTO_CHU_PAI_TIME){
            this.auto_chu_pai_timer=0;
            if(this.wait_result){
                this.ClientResponseChuPai(null,{},true);
                LogInfo("auto result");
            }
            else{
                var player=this.room_players[this.next_chu_palyer];
                if(player && player.shou_pai.length>0){
                    this.ClientChuPai(player,{pai:player.shou_pai[player.shou_pai.length-1]});
                    LogInfo("auto chu pai");
                }
            }
            
            
        }
    }
    public Release(){

        if(this.m_timer)this.m_timer.Stop();
        this.m_timer=null;
        Room.Remove(this.uid);
        var players=[];
        for(var i=0;i<this.m_clients.length;i++){
            this.m_clients[i].room=null;
        }
        for(var i=0;i<this.room_players.length;i++)
        {
            players.push(this.room_players[i].openid);
            if(this.room_players[i].client)this.room_players[i].client.player=null;
        }
        this.m_clients=[];
        this.room_players=[];
        this.pais=null;
        
        if(this.recoder_stream){
            this.recoder_stream.Free();
        }
        this.recoder_stream=null;
        if(this.state!=RoomState.IN_BLANCE)
        {
            this.state=RoomState.IN_END;
            return;
        }
        var http=new Http();
        http.OnResponse=function(state,msg){
            var json=JSON.parse(msg);
            if(state == 200 && !json.error){
                LogInfo("release room:"+msg);
            }else{
                LogInfo("release room error:"+json.error);
            }
        }
        http.Get(INFO_SERVER_URL+"playEnd?data="+EncodeUriMsg({
            info:this.info,
            players:players,
            state:this.state
        }));
        this.state=RoomState.IN_END;
    }
    public GetRoomStateInfo(c:JClient){
        var palyers=[];
        for(var i=0;i<this.room_players.length;i++){
            var p=this.room_players[i];
            var info:any={
                size1:p.GetShouPaiSize(),
                di:p.di_pai,
                qi:p.qi_pai
            }
            if(c.uid=p.uid)info.shou=p.shou_pai;
            palyers.push(info);
        }
        return {
            self:c.uid,
            jiang:this.pais.jiang_pai,
            size2:this.pais.GetSize(),
            players:palyers,
            next_player:this.room_players[this.next_chu_palyer].uid
        }
    }
    public ClientJoin(c:JClient){

        if(this.state==RoomState.IN_NONE)this.state=RoomState.IN_WAIT;
        else if(this.state > RoomState.IN_WAIT)
        {
            //重新连接
            for(var i=0;i<this.room_players.length;i++){
                var p=this.room_players[i];
                if(c.info.openid==p.openid){
                    var old_uid=p.uid;
                    p.SetPlayerInfo(c,c.info.openid);
                    this.BroadCastMessageByPlayer(p,CreateMsg(SERVER_MSG.SM_SYNC_ROOM_STATE,this.GetRoomStateInfo(c)),CreateMsg(SERVER_MSG.SM_ENTER_ROOM,{uid:p.uid,origin:old_uid}));
                    return;
                }
            }
            c.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM,{
                error:"room state error",
                state:RoomState[this.state]
            }));
            return;
        }
        else if(this.m_clients.length==ROOM_MAX_PLAYER_COUNT){
            c.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM,{
                error:"room full",
                maxclient:ROOM_MAX_PLAYER_COUNT
            }));
            return;
        }
        LogInfo("client enter room openid:"+c.info.openid);
        this.AddClient(c);
        var all_clients=[];
        for(var i=0;i<this.m_clients.length;i++){
            var other=this.m_clients[i];
            all_clients.push({
                uid:other.uid,
                state:other.state,
                info:other.info
            });
        }
        for(var i=0;i<this.m_clients.length;i++)
        {
            var other=this.m_clients[i];
            if(other.uid == c.uid){
                other.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM,{
                    self:c.uid,
                    state:this.state,
                    clients:all_clients
                }));
            }
            else{
                other.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM,{
                    state:this.state,
                    clients:all_clients
                }));
            }
        }
    }
    public ClientLeave(c:JClient){
        
        this.RemoveClient(c);
        for(var i=0;i<this.m_clients.length;i++)
        {
            this.m_clients[i].Send(CreateMsg(SERVER_MSG.SM_LEAVE_ROOM,{uid:c.uid}));
        }
        if(c.player)c.player.client=null;
        if(this.m_clients.length==0){
            this.Release();
        }
    }
    public ClientReady(c:JClient,ready:any){
        if(this.CheckStartGame())return true;
        for(var i=0;i<this.m_clients.length;i++)
        {
            this.m_clients[i].Send(CreateMsg(SERVER_MSG.SM_READY_GAME,{uid:c.uid,state:ready}));
        }
        return false;
    }
    public CheckStartGame():boolean{
        var len=this.m_clients.length;
        if(len<ROOM_MAX_PLAYER_COUNT || this.state == RoomState.IN_PLAY || this.state == RoomState.IN_BLANCE)return false;
        for(var i=0;i<len;i++){
            var c = this.m_clients[i];
            if(!c.Ready())
            {
                return false;
            }
        }
        if(WRITE_ROOM_RECODER)
        {
            if(!this.recoder_stream){
                this.recoder_stream=new AsyncFileWriter("./recoder/"+this.info.hashcode);
                var infos=[];
                for(var i=0;i<this.m_clients.length;i++){
                    infos.push([this.m_clients[i].uid,this.m_clients[i].info.openid]);
                }
                this.recoder_stream.Write(JSON.stringify(infos)+"\n");
            }
        }
        this.StartGame();
        return true;
    }
    public StartGame(){
        this.state=RoomState.IN_PLAY;
        this.room_players=[];
        for(var i=0;i<this.m_clients.length;i++)
        {
            var p = new RoomPlayer();
            p.index=i;
            var c = this.m_clients[i];
            p.SetPlayerInfo(c,c.info.openid);
            this.room_players.push(p);
        }
        this.CreatePai();
        for(var i=0;i<this.room_players.length;i++){
            var p=this.room_players[i];
            if(p.client)p.client.Send(CreateMsg(SERVER_MSG.SM_START_GAME,{uid:p.uid,shou:p.shou_pai,jiang:this.pais.jiang_pai,size2:this.pais.GetSize()}));
        }
        this.next_mo_palyer=0;
        this.CaculateResultPlayers(null);
        this.m_timer=new Timer(1,true);
        this.m_timer.Begin();
        var room=this;
        this.m_timer.OnUpdate=(frame)=>{room.OnUpdate(frame)};
    }
    //等待玩家反馈
    public CaculateResultPlayers(player:RoomPlayer)
    {
        //等待检查玩家出牌结果优先顺续,不包括出牌玩家
        this.wait_result=true;
        this.wait_result_players=[];
        this.players_result_msg_count=0;
        if(player)
        {
            for(var i=player.index+1;i<this.room_players.length;i++)
            {
                if(this.room_players[i].client) this.wait_result_players.push(this.room_players[i]);
            }
            for(var i=0;i<player.index;i++)
            {
                if(this.room_players[i].client)this.wait_result_players.push(this.room_players[i]);
            }
        }
        else
        {
            this.wait_result_players=this.room_players;
        }
    }
    public GetChuPaiPalyer():RoomPlayer{
        return this.room_players[this.next_chu_palyer];
    }
    public GetMoPaiPlayer():RoomPlayer{
        return this.room_players[this.next_mo_palyer];
    }
    //自动计算下一个摸牌和出牌玩家
    public AutoUpdateNextPlayer(){
        this.next_chu_palyer=this.next_mo_palyer%this.room_players.length;
        this.next_mo_palyer=(this.next_mo_palyer+1)%this.room_players.length;
    }
    //初始化牌
    public CreatePai(){
        this.pais=new PaiDui(true);
        //摸将牌
        var test =1;
        for(var p=0;p<this.room_players.length;p++)
        {
            for(var i=0;i<22;i++)
            {
                var pai=this.pais.Get();
                this.room_players[p].MoPai(pai);
            }
        }
    }
    //摸牌
    public MoPai(){
        var player=this.room_players[this.next_mo_palyer];
        this.AutoUpdateNextPlayer();
        var pai = 0;
        try{
            pai=this.pais.Get();
        }
        catch{
            this.BalanceGame();
            return;
        }
        player.MoPai(pai);
        this.last_mo_pai=pai;
        this.last_mo_pai_player=player;
        
        
        for(var i=0;i<this.room_players.length;i++){
            var p=this.room_players[i];
            if(p.index == player.index){
                if(p.client)p.client.Send(CreateMsg(SERVER_MSG.SM_MO_PAI,{
                    uid:player.uid,
                    pai:pai,
                    size1:p.GetShouPaiSize(),
                    size2:this.pais.GetSize()
                }));
            }
            else {
                if(p.client)p.client.Send(CreateMsg(SERVER_MSG.SM_MO_PAI,{
                    uid:player.uid,
                    size1:player.GetShouPaiSize(),
                    size2:this.pais.GetSize()
                }));
            }
        }
    }
    //玩家出牌
    public ClientChuPai(player:RoomPlayer,msg){
        var value=msg.pai;
        if(player == null)return;
        if(player.index == this.next_chu_palyer){
            if(!player.ChuPai(value))
            {
                if(player.client)player.client.Send(CreateMsg(SERVER_MSG.SM_CHU_PAI,{
                    uid:player.uid,
                    error:"not found : "+value
                }));
                return;
            };
            
            this.last_chu_pai=value;
            this.last_chu_pai_player=player;
            //谁摸谁出,出的牌和摸的牌不一样就不可能天听了.
            if(!Pai.Equal(this.last_mo_pai,this.last_chu_pai))
            {
                player.tian_ting=false;
            }
            var send_msg1=CreateMsg(SERVER_MSG.SM_CHU_PAI,{
                uid:player.uid,
                pai:value,
                shou:player.shou_pai
            });
            var send_msg2=CreateMsg(SERVER_MSG.SM_CHU_PAI,{
                uid:player.uid,
                pai:value,
                size1:player.GetShouPaiSize()
            });
            for(var i=0;i<this.room_players.length;i++){
                var p=this.room_players[i];
                if(p.client){
                    if(p.index == player.index)p.client.Send(send_msg1);
                    else p.client.Send(send_msg2);
                }
                
                
            }
            this.CaculateResultPlayers(player);
        }
    }
    public BroadCastMessageByPlayer(player:RoomPlayer,player_msg:string,other_msg:string){
        var nstring=new NString();
        nstring.Append(other_msg);
        for(var i=0;i<this.room_players.length;i++){
            var p=this.room_players[i];
            if(p.client){
                if(p.index == player.index){
                    p.client.Send(player_msg);
                }
                else{
                    p.client.SendNString(nstring);
                }
            }
            
        }
        nstring=null;
    }
    public BroadCastMessage(msg:string){
        var nstring=new NString();
        nstring.Append(msg);
        for(var i=0;i<this.room_players.length;i++){
            var p=this.room_players[i];
            if(p.client)p.client.SendNString(nstring);
        }
        nstring=null;
    }
    //结算
    public BalanceGame(){
        this.state=RoomState.IN_BLANCE;
        var msgs=[];
        for(var i=0;i<this.room_players.length;i++){
            
            var p = this.room_players[i];
            if(p.client)p.client.state=State.IN_BLANCE;
            if(p.hu_pai_info == null){
                p.CaculateHu(this.pais);
            }
            var msg:any={
                playcount:this.info.playcount,
                uid:p.uid,
                shou:p.shou_pai,
                di:p.di_pai,
                hu:p.hu_pai_info.hu_pai_array,
                score:p.hu_pai_info.totle_socre,
                
            }
            if(p.hui_pai){
                msg.uid2=p.hui_pai_uid;
                msg.type1=p.hu_pai_info.hu_pai_type,
                msg.type2=p.hu_pai_info.hu_type
            }
            msgs.push(msg);
        }
        LogInfo("Hu Pai La ........");
        this.BroadCastMessage(CreateMsg(SERVER_MSG.SM_GAME_BALANCE,msgs));
        this.Release();
    }
    // public CaculatePlayerTotleScore(player:RoomPlayer){
    //     var hu_pai_info = player.hu_pai_info;
    //     player.hui_pai_uid=this.last_chu_pai_player==null?player.client.uid: this.last_chu_pai_player.client.uid;
    //     var score = hu_pai_info.totle_socre;
    //     //自摸
    //     if(this.last_mo_pai_player.index == player.index){
    //         hu_pai_info.hu_pai_type |= HuPaiType.ZI_MO;
    //         hu_pai_info.hu_type_score += 10;
    //     }
    //     //天胡
    //     if(this.chu_pai_count == 0){
    //         hu_pai_info.hu_pai_type |=HuPaiType.TIANG_HU;
    //         hu_pai_info.di_hu_score *= 4;
    //     }
    //     //天听
    //     else if(player.tian_ting){
    //         hu_pai_info.hu_pai_type |= HuPaiType.TIANG_TING;
    //         hu_pai_info.di_hu_score *=2;
    //     }
    //     //穷喜
    //     if(hu_pai_info.xi_array.length==0){
    //         hu_pai_info.di_hu_score *=2;
    //     }
    //     hu_pai_info.CaculateTotleScore();

    // }
    //玩家回复出牌或者发牌消息
    public ClientResponseChuPai(client:JClient,msg,time_out:boolean=false){
        //摸完牌后,自摸,杠,等操作
        if(client && client.player.index == this.next_chu_palyer ){
            //自摸
            if(msg.type == PaiMessageResponse.RESULT_HU){
                var ret =client.player.ZiMo(this.pais.GetPaiDetail(this.last_mo_pai),this.pais);
                if(ret){
                    var hu_pai_info=client.player.hu_pai_info;
                    //this.CaculatePlayerTotleScore(client.player);
                    this.BroadCastMessage(CreateMsg(SERVER_MSG.SM_HU_PAI,{
                        uid:client.uid,
                        uid2:client.uid,
                        type1:hu_pai_info.hu_pai_type,
                        type2:hu_pai_info.hu_type,
                        pai:this.last_mo_pai
                    }));
                    this.BalanceGame();
                }
                LogInfo("client zi mo:"+ret +" uid:"+client.uid);
                return;
            }
            //按杠
            else if(msg.type == PaiMessageResponse.RESULT_GANG){
                var an_gan=client.player.AnGang(this.last_mo_pai);
                if(an_gan || client.player.Gang(this.last_mo_pai))
                {
                    this.auto_chu_pai_timer=0;
                    this.next_mo_palyer=client.player.index;
                    var player_msg={
                        uid:client.uid,
                        pai:this.last_mo_pai,
                        shou:client.player.shou_pai,
                        di:client.player.di_pai
                    }
                    var other_msg={
                        uid:client.uid,
                        pai:this.last_mo_pai,
                        di:client.player.di_pai,
                        size1:client.player.GetShouPaiSize()
                    }
                    this.BroadCastMessageByPlayer(client.player,CreateMsg(SERVER_MSG.SM_GANG_PAI,player_msg),CreateMsg(SERVER_MSG.SM_GANG_PAI,other_msg));
                    this.wait_result=false;
                    this.MoPai();
                }
                return;
            }
        }

        //不是等待确认出牌回合
        if(!this.wait_result)return ;
        //玩家碰牌
        
        if(msg.type == PaiMessageResponse.RESULT_PENG)
        {
            if(client.player.Peng(this.last_chu_pai))
            {
                this.auto_chu_pai_timer=0;
                this.next_mo_palyer=client.player.index;
                this.AutoUpdateNextPlayer();
                var player_msg={
                    uid:client.uid,
                    pai:this.last_chu_pai,
                    shou:client.player.shou_pai,
                    di:client.player.di_pai
                }
                var other_msg={
                    uid:client.uid,
                    pai:this.last_chu_pai,
                    di:client.player.di_pai,
                    size1:client.player.GetShouPaiSize()
                }
                this.BroadCastMessageByPlayer(client.player,CreateMsg(SERVER_MSG.SM_PENG_PAI,player_msg),CreateMsg(SERVER_MSG.SM_PENG_PAI,other_msg));
                this.wait_result=false;
            }
            return;
        }
        else  if(msg.type == PaiMessageResponse.RESULT_GANG)
        {
            if(client.player.Gang(this.last_chu_pai))
            {
                this.auto_chu_pai_timer=0;
                this.next_mo_palyer=client.player.index;
                var player_msg={
                    uid:client.uid,
                    pai:this.last_chu_pai,
                    shou:client.player.shou_pai,
                    di:client.player.di_pai
                }
                var other_msg={
                    uid:client.uid,
                    pai:this.last_chu_pai,
                    di:client.player.di_pai,
                    size1:client.player.GetShouPaiSize()
                }
                this.BroadCastMessageByPlayer(client.player,CreateMsg(SERVER_MSG.SM_GANG_PAI,player_msg),CreateMsg(SERVER_MSG.SM_GANG_PAI,other_msg));
                this.wait_result=false;
                this.MoPai();
            }
            return;
        }
        
        
        if(!time_out){
            var find=false;
            for(var i=0;i<this.wait_result_players.length;i++){
                if(client.player.index == this.wait_result_players[i].index)
                {
                    this.wait_result_players[i].result_msg=msg;
                    this.players_result_msg_count++;
                    find=true;
                    break;
                }
            }
            if(!find && this.wait_result_players.length>0)return;
        }
        
        for(var i=0;i<this.wait_result_players.length;i++){
            var p = this.wait_result_players[i];
            var ret_msg = p.result_msg;
            if(!ret_msg)continue;
            if(ret_msg.type == PaiMessageResponse.RESULT_HU){
                var ret = p.Hu(this.last_chu_pai,this.pais);
                
                if(ret){
                    //把胡的牌摸到手上
                    p.MoPai(this.last_chu_pai);
                    //设置胡的谁的牌
                    var hu_pai_info = p.hu_pai_info;
                    p.hui_pai_uid=this.last_chu_pai_player.uid;
                    
                    var broad_msg={
                        uid:p.uid,
                        uid2:this.GetChuPaiPalyer().uid,
                        pai:this.last_chu_pai
                    }
                    
                    this.BroadCastMessage(CreateMsg(SERVER_MSG.SM_HU_PAI,broad_msg));
                    this.BalanceGame();
                    
                }
                
                return;
            }
        }
        
        if((this.players_result_msg_count == this.wait_result_players.length)||time_out)
        {
            this.auto_chu_pai_timer=0;
            if(this.last_chu_pai_player)this.last_chu_pai_player.AddQiPais(this.last_chu_pai);
            this.wait_result=false;
            this.MoPai();
            LogInfo("time out:"+time_out);
        }
    }

    public ClientHuanPai(client:JClient,msg){
        var player =client.player;
        if(player == null)return;
        var old_pais=msg;
        var new_pais=[];
        var ok=true;
        var error_pai=-1;
        if(old_pais.length>0)
        {
            for(var i=0;i<old_pais.length;i++)
            {
                if(old_pais[i]>120&&player.ChuPai(old_pais[i]))
                {
                    var pai = 0;
                    try{
                        pai=this.pais.Get();
                    }
                    catch{
                        this.BalanceGame();
                        return;
                    }
                    if(pai>0)
                    {
                        new_pais.push(pai);
                        player.MoPai(pai);
                    }
                    else
                    {
                        error_pai=old_pais[i];
                        ok=false;
                        break;
                    }

                }
                else
                {
                    error_pai=old_pais[i];
                    ok=false;
                    break;
                }
            }
        }
        else
        {
            ok=false;
        }
        if(ok)
        {
            player.AddDiPais(old_pais);
            var self_msg=CreateMsg(SERVER_MSG.SM_HUAN_PAI,{
                uid:client.uid,
                shou:player.shou_pai,
                di:player.di_pai
            });
            var other_msg=CreateMsg(SERVER_MSG.SM_HUAN_PAI,{
                uid:client.uid,
                di:player.di_pai
            });
            this.BroadCastMessageByPlayer(client.player,self_msg,other_msg);
        }
        else
        {
            client.Send(CreateMsg(SERVER_MSG.SM_HUAN_PAI,{error:"pai not found:"+error_pai}));
        }
        
    }
}
