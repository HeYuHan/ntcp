require("client.js");

//筒,条,万,红花,百花,千字,喜字
//1-40 万,红花
//41-80 条,百花
//81-120 筒,千
//121-125 喜
var PaiType={
    PAI_WANG:1,
    PAI_TIAO:2,
    PAI_TONG:3,
    
    PAI_HONG:4,
    PAI_BAI:5,
    PAI_QIAN:6,
    PAI_XI:7
}
//不要,碰,杠,胡,喜
var PaiMessageResponse={
    RESULT_NONE:0,
    RESULT_PENG:1,
    RESULT_GANG:2,
    RESULT_HU:3,
    RESULT_XI:4,
}
function Pai(include_xipai){
    this.type_count=[];
    var type_len=include_xipai?11:10;
    for(var i=0;i<type_len;i++){
        this.type_count.push(0);
    }
    var pai_len=include_xipai?125:120;
    this.pais=new RandomInt(1,pai_len+1);
}
Pai.prototype.Get=function(){
    var ret={ok:true};
    try {
        ret.value=this.pais.Get();
    } catch (error) {
        ret.ok=false;
    }
    return ret;
}
Pai.prototype.GetPaiValue=function(value){
    if(value<41){
        var ret={};
        ret.value=value%10;
        ret.type= (ret.value == 0)?PaiType.PAI_HONG:PaiType.PAI_WANG;
        return ret;
    }
    else if(value<81){
        var ret={};
        ret.value=value%10;
        ret.type= (ret.value == 0)?PaiType.PAI_BAI:PaiType.PAI_TIAO;
        return ret;
    }
    else if(value<121){
        var ret={};
        ret.value=value%10;
        ret.type= (ret.value == 0)?PaiType.PAI_QIAN:PaiType.PAI_TONG;
        return ret;
    }
    else
    {
        var ret={};
        ret.value=value%125;
        ret.type= PaiType.PAI_XI;
        return ret;
    }
}
Pai.prototype.GetSize=function(){
    return this.pais.GetRecoderSize();
}

function RoomPlayer(){
    this.index=0;
    //手牌
    this.shou_pai=[];
    //底牌:碰,杠,喜
    this.di_pai=[];
    //弃牌
    this.qi_pai=[];
}
//放在手下的牌,碰的,杠的
RoomPlayer.prototype.AddDiPai=function(value){
    if(typeof(value) == "number")
    {
        this.di_pai.push(value);
    }
    else
    {
        for(var i = 0;i<value.length;i++)
        {
            this.di_pai.push(value[i]);
        }
    }
}
//丢弃的牌
RoomPlayer.prototype.AddQiPai=function(value){
    if(typeof(value) == "number")
    {
        this.qi_pai.push(value);
    }
    else
    {
        for(var i = 0;i<value.length;i++)
        {
            this.qi_pai.push(value[i]);
        }
    }
}
RoomPlayer.prototype.SetPlayerInfo=function(client,openid){
    this.client=client;
    this.openid=openid;
    this.client.player=this;
}
RoomPlayer.prototype.HavePai=function(value)
{
    return this.shou_pai.indexOf(value);
}
RoomPlayer.prototype.SortPai=function(){
    this.shou_pai.sort();
}
RoomPlayer.prototype.MoPai=function(pai){
    this.shou_pai.push(pai);
}
RoomPlayer.prototype.ChuPai=function(value){
    var index=this.shou_pai.indexOf(value);
    if(index>=0)
    {
        this.shou_pai.splice(index,1);
        return true;
    }
    return false;
}
RoomPlayer.prototype.GetShouPaiSize=function(){
    return this.shou_pai.length;
}
RoomPlayer.prototype.Peng=function(value){
    var count = 0;
    var temp=[];
    for(var i=0;i<this.shou_pai.length;i++)
    {
        var pai=this.shou_pai[i];
        if(pai == value)
        {
            count++;
        }
        else
        {
            temp.push(value);
        }
    }
    if(count>1)
    {
        this.shou_pai=temp;
        return true;
    }
    return false;
}
RoomPlayer.prototype.Gang=function(value){
    var count = 0;
    var temp=[];
    for(var i=0;i<this.shou_pai.length;i++)
    {
        var pai=this.shou_pai[i];
        if(pai == value)
        {
            count++;
        }
        else
        {
            temp.push(value);
        }
    }
    if(count>2)
    {
        this.shou_pai=temp;
        return true;
    }
    return false;
}

var RoomState={
    IN_NONE:0,
    IN_WAIT:1,
    IN_PLAY:2,
    IN_BLANCE:3
}
function Room(){
    this.m_Clients=[];
    this.m_Timer=new Timer(0.1,true);
    this.uid=Room.m_RandomUID.Get();
    this.state=RoomState.IN_NONE;
    this.room_players=[];
    //整幅牌
    this.pais=null;
    //将牌
    this.jiang_pai=[];
}
Room.m_RandomUID=new RandomInt(100000,999999,false);
Room.gRoomList=[];
Room.Create=function(){
    var room = new Room();
    Room.gRoomList.push(room);
    return room;
}
Room.Get=function(uid){
    for(var i=0;i<Room.gRoomList.length;i++)
    {
        
        var room=Room.gRoomList[i];
        if(room.uid==uid)return room;
    }
    return null;
}
Room.Remove=function(uid){
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
Room.prototype.AddClient=function(c){
    this.m_Clients.push(c);
}
Room.prototype.RemoveClient=function(c){
    var index=this.m_Clients.indexOf(c);
    if(index>0)this.m_Clients.splice(index,1);
}
Room.prototype.Init=function(){
    var context=this;
    this.m_Timer.OnUpdate=function(t){
        context.OnUpdate(t);
    }
    this.m_Timer.Begin();
}
Room.prototype.Release=function(){
    this.m_Timer.Stop();
    this.m_Clients=[];
    Room.Remove(this.uid);
    Room.m_RandomUID.ReleaseValue(this.uid);
}
Room.prototype.OnUpdate=function(t){
}
Room.prototype.ClientJoin=function(c){
    if(this.state==RoomState.IN_NONE)this.state=RoomState.IN_WAIT;
    this.AddClient(c);
    var all_clients=[];
    for(var i=0;i<this.m_Clients.length;i++){
        var other=this.m_Clients[i];
        all_clients.push({
            uid:other.uid,
            state:other.state,
            info:other.info
        });
    }
    for(var i=0;i<this.m_Clients.length;i++)
    {
        this.m_Clients[i].Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM,{
            state:this.state,
            clients:all_clients
        }));
    }
   
}
Room.prototype.ClientLeave=function(c){
    this.RemoveClient(c);
    for(var i=0;i<this.m_Clients.length;i++)
    {
        this.m_Clients[i].Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM,{uid:c.uid}));
    }
}
Room.prototype.ClientReady=function(c,ready){
    if(this.CheckStartGame())return true;
    for(var i=0;i<this.m_Clients.length;i++)
    {
        this.m_Clients[i].Send(CreateMsg(SERVER_MSG.SM_READY_GAME,{uid:c.uid,state:ready}));
    }
    return false;
}
Room.prototype.CheckStartGame=function(){
    var len=this.m_Clients.length;
    if(len<2 || this.state == RoomState.IN_PLAY)return false;
    for(var i=0;i<len;i++){
        var c = this.m_Clients[i];
        if(!c.Ready())
        {
            return false;
        }
    }
    this.StartGame();
    return true;
}
Room.prototype.StartGame=function(){
    this.state=RoomState.IN_PLAY;
    this.room_players=[];
    for(var i=0;i<this.m_Clients.length;i++)
    {
        var p = new RoomPlayer();
        p.index=i;
        var c = this.m_Clients[i];
        c.state=State.IN_GAME;
        p.SetPlayerInfo(c,c.info.openid);
        this.room_players.push(p);
    }
    this.CreatePai();
    for(var i=0;i<this.room_players.length;i++){
        var p=this.room_players[i];
        p.client.Send(CreateMsg(SERVER_MSG.SM_START_GAME,{shou:p.shou_pai}));
    }
    this.next_mo_palyer=0;
    this.CaculateResultPlayers(null);
}
//初始化牌
Room.prototype.CreatePai=function(){
    this.pais=new Pai(true);
    //摸将牌
    this.jiang_pai=[];
    this.jiang_pai.push(this.pais.Get().value);
    this.jiang_pai.push(this.pais.Get().value);
    for(var p=0;p<this.room_players.length;p++)
    {
        for(var i=0;i<22;i++)
        {
            var pai=this.pais.Get();
            this.room_players[p].MoPai(pai.value);
        }
    }
}
//自动计算下一个摸牌和出牌玩家
Room.prototype.AutoUpdateNextPlayer=function(){
    this.next_chu_palyer=this.next_mo_palyer;
    this.next_mo_palyer=(this.next_mo_palyer+1)%this.room_players.length;
}
//摸牌
Room.prototype.MoPai=function(){
    var player=this.room_players[this.next_mo_palyer];
    this.AutoUpdateNextPlayer();

    var pai=this.pais.Get();
    player.MoPai(pai.value);
    for(var i=0;i<this.room_players.length;i++){
        var p=this.room_players[i];
        if(p.index == player.index){
            p.client.Send(CreateMsg(SERVER_MSG.SM_MO_PAI,{
                uid:player.client.uid,
                pai:pai.value,
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

//等待玩家反馈
Room.prototype.CaculateResultPlayers=function(player)
{
    //等待检查玩家出牌结果优先顺续,不包括出牌玩家
    this.wait_result_players=[];
    this.players_result_msg_count=0;
    if(player)
    {
        for(var i=player.index+1;i<player.length;i++)
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
//玩家出牌
Room.prototype.ClientChuPai=function(client,msg){
    var player=client.player;
    var value=msg.pai;
    if(player == null)return;
    if(player.index == this.next_chu_palyer){
        if(!player.ChuPai(value))return;
        var send_msg1=CreateMsg(SERVER_MSG.SM_CHU_PAI,player.shou_pai);
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
//玩家回复出牌或者发牌消息
Room.prototype.ClientResponseChuPai=function(client,msg){
    //玩家碰牌
    if(msg.type == PaiMessageResponse.RESULT_PENG)
    {
        return;
    }
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
    if(!find)return;
    if(this.players_result_msg_count == this.wait_result_players.length)
    {
        this.MoPai();
    }
}

Room.prototype.ClientHuanPai=function(client,msg){
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
                if(pai.ok)
                {
                    new_pais.push(pai.value);
                    player.MoPai(pai.value);
                }
                else
                {
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
        player.AddDiPai(old_pais);
        client.Send(CreateMsg(SERVER_MSG.SM_HUAN_PAI,{
            shou:player.shou_pai,
            di:player.di_pai
        }));
    }
    else
    {
        client.Send(CreateMsg(SERVER_MSG.SM_HUAN_PAI,{error:"pai not found:"+error_pai}));
    }
    
}