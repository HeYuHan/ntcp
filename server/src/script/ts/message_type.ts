enum CLIENT_MSG{
    CM_ENTER_ROOM,
    CM_LEAVE_ROOM,
    CM_READY_GAME,
    CM_START_GAME,
    CM_GET_ROOM_INFO,
    CM_CHU_PAI,
    CM_RESPON_CHU_PAI,//回复出牌
    CM_HUAN_PAI,//换牌
    CM_MAI_ZHUANG,//买庄
}
enum SERVER_MSG{
    SM_ENTER_ROOM,
    SM_LEAVE_ROOM,
    SM_READY_GAME,
    SM_START_GAME,
    SM_MO_PAI,
    SM_CHU_PAI,
    SM_HUAN_PAI,//换牌
    SM_PENG_PAI,//碰牌
    SM_GANG_PAI,//杠牌
    SM_HU_PAI,//胡牌
    SM_GAME_BALANCE,//进入结算,
    SM_SYNC_ROOM_STATE,//断线重新连接
    SM_MAI_ZHUANG,//买庄
}
function CreateMsg(id:number,msg:any):string{
    return JSON.stringify([id,msg]);
}
function EncodeUriMsg(msg){
    return encodeURIComponent(JSON.stringify(msg));
}