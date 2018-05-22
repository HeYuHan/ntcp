var CLIENT_MSG={
    CM_LOGIN:1,
    CM_CREATE_ROOM:2,
    CM_ENTER_ROOM:3,
    CM_LEAVE_ROOM:4,
    CM_READY_GAME:5,
    CM_START_GAME:6,
    CM_GET_ROOM_INFO:7,
    CM_CHU_PAI:8,
    CM_RESPON_CHU_PAI:9,//回复出牌
    CM_HUAN_PAI:10,//换牌
}
var SERVER_MSG={
    SM_LOGIN:1,
    SM_CREATE_ROOM:2,
    SM_ENTER_ROOM:3,
    SM_LEAVE_ROOM:4,
    SM_READY_GAME:5,
    SM_START_GAME:6,
    SM_MO_PAI:7,
    SM_CHU_PAI:8,
    SM_HUAN_PAI:9,//换牌
}
function CreateMsg(id,msg){
    return JSON.stringify({
        id:id,
        msg:msg
    });
}