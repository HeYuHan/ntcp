



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
    public openid:string;
    //天听
    public tian_ting:boolean=false;
    //天胡
    public tian_hu:boolean =false;
    //叫牌
    public jiao_pai_array:Array<number>=[];
    //按杠的牌
    public an_gang_array:Array<number>=[];
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
        this.client=client;
        this.openid=openid;
        client.player=this;
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
        Debug.Log("palyer index:"+this.index+" shou pai:"+msg);
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
        //Debug.Log(temp_di);
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
        var temp_shou=[];
        var temp_di=[];
        for(var i=0;i<this.shou_pai.length;i++)
        {
            var pai = this.shou_pai[i];
            if(temp_di.length<4 && Pai.Equal(pai,value))
            {
                temp_di.push(pai);
            }
            else
            {
                temp_shou.push(pai);
            }
        }
        if(temp_di.length>3)
        {
            this.AddDiPais(temp_di);
            this.shou_pai=temp_shou;
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
        return false;
    }
    public CaculateHu(pais:PaiDui){
        this.hui_pai=false;
        this.hu_pai_info = pais.CaculateDiHu(this.shou_pai,this.di_pai,this.an_gang_array,true);
        this.hu_pai_info.CaculateTotleScore();
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
            for(var i=0;i<result_array.length;i++){
                var shou=Pai.DetailToNumberArray(result_array[i]);
                this.di_pai.sort(PaiDui.SortPaiArray);
                var info = pais.CaculateDiHu(shou,this.di_pai,this.an_gang_array,false);
                info.CaculateOtherScore(pais.GetPaiDetail(pai));
                info.CaculateTotleScore();
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
            this.hui_pai=true;
            var di_info_array:Array<HuPaiInfo>=[];
            for(var i=0;i<result_array.length;i++){
                var shou=Pai.DetailToNumberArray(result_array[i]);
                var info = pais.CaculateDiHu(shou,null,null,false);
                info.CaculateOtherScore(pai);
                info.CaculateTotleScore();
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
    private m_timer:Timer=new Timer(0.1,true);
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
    private chu_pai_count:number=0;
    //最后出牌的玩家
    private last_chu_pai_player:RoomPlayer=null;
    //最后摸牌的玩家
    private last_mo_pai_player:RoomPlayer=null;
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
        if(index>0)this.m_clients.splice(index,1);
    }
    public Init(){
        var self=this;
        this.m_timer.OnUpdate=(t)=>{self.OnUpdate(t)}
        this.m_timer.Begin();
    }
    public OnUpdate(t:number){

    }
    public Release(){

        this.m_timer.Stop();
        this.m_clients=[];
        Room.Remove(this.uid);
        for(var i=0;i<this.room_players.length;i++)
        {
            this.room_players[i].client.player=null;
        }
        this.room_players=[];
        this.pais=null;
        this.state=RoomState.IN_END;
        var http=new Http();
        var room=this;
        http.OnResponse=function(state,msg){
            var json=JSON.parse(msg);
            if(state == 200 && !json.error){
                Debug.Log("release room:"+msg);
            }else{
                Debug.Log("release room error:"+json.error);
            }
        }
        http.Get(INFO_SERVER_URL+"playEnd?data="+EncodeUriMsg({
            roomid:this.info.roomid,
            hashcode:this.info.hashcode
        }));
    }
    public ClientJoin(c:JClient){
        if(this.state==RoomState.IN_NONE)this.state=RoomState.IN_WAIT;
        else if(this.state > RoomState.IN_WAIT)return;
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
            this.m_clients[i].Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM,{uid:c.uid}));
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
            c.state=State.IN_GAME;
            p.SetPlayerInfo(c,c.info.openid);
            this.room_players.push(p);
        }
        this.CreatePai();
        for(var i=0;i<this.room_players.length;i++){
            var p=this.room_players[i];
            p.client.Send(CreateMsg(SERVER_MSG.SM_START_GAME,{shou:p.shou_pai,jiang:this.pais.jiang_pai,size2:this.pais.GetSize()}));
        }
        this.next_mo_palyer=0;
        this.CaculateResultPlayers(null);
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
                this.wait_result_players.push(this.room_players[i]);
            }
            for(var i=0;i<player.index;i++)
            {
                this.wait_result_players.push(this.room_players[i]);
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
        this.pais.MoJiangPai();
    }
    //摸牌
    public MoPai(){
        var player=this.room_players[this.next_mo_palyer];
        this.AutoUpdateNextPlayer();
        var pai=this.pais.Get();
        player.MoPai(pai);
        this.last_mo_pai=pai;
        this.last_mo_pai_player=player;
        
        
        for(var i=0;i<this.room_players.length;i++){
            var p=this.room_players[i];
            if(p.index == player.index){
                p.client.Send(CreateMsg(SERVER_MSG.SM_MO_PAI,{
                    uid:player.client.uid,
                    pai:pai,
                    size1:p.GetShouPaiSize(),
                    size2:this.pais.GetSize()
                }));
            }
            else {
                p.client.Send(CreateMsg(SERVER_MSG.SM_MO_PAI,{
                    uid:player.client.uid,
                    size1:player.GetShouPaiSize(),
                    size2:this.pais.GetSize()
                }));
            }
        }
    }
    //玩家出牌
    public ClientChuPai(client:JClient,msg){
        var player=client.player;
        var value=msg.pai;
        if(player == null)return;
        if(player.index == this.next_chu_palyer){
            if(!player.ChuPai(value))
            {
                client.Send(CreateMsg(SERVER_MSG.SM_CHU_PAI,{
                    uid:player.client.uid,
                    error:"not found : "+value
                }));
                return;
            };
            this.chu_pai_count++;
            this.last_chu_pai=value;
            this.last_chu_pai_player=player;
            var send_msg1=CreateMsg(SERVER_MSG.SM_CHU_PAI,{
                uid:player.client.uid,
                pai:value,
                shou:player.shou_pai
            });
            var send_msg2=CreateMsg(SERVER_MSG.SM_CHU_PAI,{
                uid:player.client.uid,
                pai:value,
                size1:player.GetShouPaiSize()
            });
            for(var i=0;i<this.room_players.length;i++){
                var p=this.room_players[i];
                if(p.index == player.index)p.client.Send(send_msg1);
                else p.client.Send(send_msg2);
                
            }
            this.CaculateResultPlayers(player);
        }
    }
    public BroadCastMessageByPlayer(player:RoomPlayer,player_msg:string,other_msg:string){
        var nstring=new NString();
        nstring.Append(other_msg);
        for(var i=0;i<this.room_players.length;i++){
            var p=this.room_players[i];
            if(p.index == player.index){
                p.client.Send(player_msg);
            }
            else{
                p.client.SendNString(nstring);
            }
        }
        nstring=null;
    }
    public BroadCastMessage(msg:string){
        var nstring=new NString();
        nstring.Append(msg);
        for(var i=0;i<this.room_players.length;i++){
            this.room_players[i].client.SendNString(nstring);
        }
        nstring=null;
    }
    //结算
    public BalanceGame(){
        this.state=RoomState.IN_BLANCE;
        var msgs=[];
        for(var i=0;i<this.room_players.length;i++){
            
            var p = this.room_players[i];
            p.client.state=State.IN_BLANCE;
            if(p.hu_pai_info == null){
                p.CaculateHu(this.pais);
            }
            var msg:any={
                playcount:this.info.playcount,
                uid:p.client.uid,
                shou:p.shou_pai,
                di:p.di_pai,
                score:p.hu_pai_info.totle_socre
            }
            if(p.hui_pai){
                msg.uid2=p.hui_pai_uid;
                msg.type1=p.hu_pai_info.hu_pai_type,
                msg.type2=p.hu_pai_info.hu_type
            }
            msgs.push(msg);
        }
        this.BroadCastMessage(CreateMsg(SERVER_MSG.SM_GAME_BALANCE,msgs));
        this.Release();
    }
    public CaculatePlayerTotleScore(player:RoomPlayer){
        var hu_pai_info = player.hu_pai_info;
        player.hui_pai_uid=this.last_chu_pai_player==null?player.client.uid: this.last_chu_pai_player.client.uid;
        var score = hu_pai_info.totle_socre;
        //自摸
        if(this.last_mo_pai_player.index == player.index){
            hu_pai_info.hu_pai_type |= HuPaiType.ZI_MO;
            hu_pai_info.hu_type_score += 10;
        }
        //天胡
        if(this.chu_pai_count == 0){
            hu_pai_info.hu_pai_type |=HuPaiType.TIANG_HU;
            hu_pai_info.di_hu_score *= 4;
        }
        //天听
        else if(player.tian_ting){
            hu_pai_info.hu_pai_type |= HuPaiType.TIANG_TING;
            hu_pai_info.di_hu_score *=2;
        }
        //穷喜
        if(hu_pai_info.xi_array.length==0){
            hu_pai_info.di_hu_score *=2;
        }
        hu_pai_info.CaculateTotleScore();

    }
    //玩家回复出牌或者发牌消息
    public ClientResponseChuPai(client:JClient,msg){
        //摸完牌后,自摸,杠,等操作
        if(client.player.index == this.next_chu_palyer ){
            //自摸
            if(msg.type == PaiMessageResponse.RESULT_HU){
                var ret =client.player.ZiMo(this.pais.GetPaiDetail(this.last_mo_pai),this.pais);
                if(ret){
                    var hu_pai_info=client.player.hu_pai_info;
                    this.CaculatePlayerTotleScore(client.player);
                    this.BroadCastMessage(CreateMsg(SERVER_MSG.SM_HU_PAI,{
                        uid:client.uid,
                        uid2:client.uid,
                        type1:hu_pai_info.hu_pai_type,
                        type2:hu_pai_info.hu_type,
                        pai:this.last_mo_pai
                    }));
                    this.BalanceGame();
                }
                Debug.Log("client zi mo:"+ret +" uid:"+client.uid);
                return;
            }
            //按杠
            else if(msg.type == PaiMessageResponse.RESULT_GANG){
                if(client.player.AnGang(this.last_chu_pai))
                {
                    
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
        }

        //不是等待确认出牌回合
        if(!this.wait_result)return ;
        //玩家碰牌
        
        if(msg.type == PaiMessageResponse.RESULT_PENG)
        {
            if(client.player.Peng(this.last_chu_pai))
            {
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
        
        Debug.Log("wait_result_players:"+this.wait_result_players.length);
        Debug.Log("players_result_msg_count:"+this.players_result_msg_count);
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
        for(var i=0;i<this.wait_result_players.length;i++){
            var p = this.wait_result_players[i];
            var ret_msg = p.result_msg;
            if(ret_msg.type == PaiMessageResponse.RESULT_HU){
                var ret = p.Hu(this.last_chu_pai,this.pais);
                if(ret){
                    //把胡的牌摸到手上
                    p.MoPai(this.last_chu_pai);
                    //设置胡的谁的牌
                    var hu_pai_info = p.hu_pai_info;
                    p.hui_pai_uid=this.last_chu_pai_player.client.uid;
                    
                    var broad_msg={
                        uid:p.client.uid,
                        target_uid:this.GetChuPaiPalyer().client.uid,
                        pai:this.last_chu_pai
                    }
                    this.BroadCastMessage(CreateMsg(SERVER_MSG.SM_HU_PAI,broad_msg));
                }
                this.BalanceGame();
                return;
            }
        }
        if(this.players_result_msg_count == this.wait_result_players.length)
        {
            
            this.wait_result=false;
            this.MoPai();
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
                    var pai=this.pais.Get();
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
