var CLIENT_MSG;
(function (CLIENT_MSG) {
    CLIENT_MSG[CLIENT_MSG["CM_ENTER_ROOM"] = 0] = "CM_ENTER_ROOM";
    CLIENT_MSG[CLIENT_MSG["CM_LEAVE_ROOM"] = 1] = "CM_LEAVE_ROOM";
    CLIENT_MSG[CLIENT_MSG["CM_READY_GAME"] = 2] = "CM_READY_GAME";
    CLIENT_MSG[CLIENT_MSG["CM_START_GAME"] = 3] = "CM_START_GAME";
    CLIENT_MSG[CLIENT_MSG["CM_GET_ROOM_INFO"] = 4] = "CM_GET_ROOM_INFO";
    CLIENT_MSG[CLIENT_MSG["CM_CHU_PAI"] = 5] = "CM_CHU_PAI";
    CLIENT_MSG[CLIENT_MSG["CM_RESPON_CHU_PAI"] = 6] = "CM_RESPON_CHU_PAI";
    CLIENT_MSG[CLIENT_MSG["CM_HUAN_PAI"] = 7] = "CM_HUAN_PAI";
})(CLIENT_MSG || (CLIENT_MSG = {}));
var SERVER_MSG;
(function (SERVER_MSG) {
    SERVER_MSG[SERVER_MSG["SM_ENTER_ROOM"] = 0] = "SM_ENTER_ROOM";
    SERVER_MSG[SERVER_MSG["SM_LEAVE_ROOM"] = 1] = "SM_LEAVE_ROOM";
    SERVER_MSG[SERVER_MSG["SM_READY_GAME"] = 2] = "SM_READY_GAME";
    SERVER_MSG[SERVER_MSG["SM_START_GAME"] = 3] = "SM_START_GAME";
    SERVER_MSG[SERVER_MSG["SM_MO_PAI"] = 4] = "SM_MO_PAI";
    SERVER_MSG[SERVER_MSG["SM_CHU_PAI"] = 5] = "SM_CHU_PAI";
    SERVER_MSG[SERVER_MSG["SM_HUAN_PAI"] = 6] = "SM_HUAN_PAI";
    SERVER_MSG[SERVER_MSG["SM_PENG_PAI"] = 7] = "SM_PENG_PAI";
    SERVER_MSG[SERVER_MSG["SM_GANG_PAI"] = 8] = "SM_GANG_PAI";
    SERVER_MSG[SERVER_MSG["SM_HU_PAI"] = 9] = "SM_HU_PAI";
    SERVER_MSG[SERVER_MSG["SM_GAME_BALANCE"] = 10] = "SM_GAME_BALANCE";
})(SERVER_MSG || (SERVER_MSG = {}));
function CreateMsg(id, msg) {
    return JSON.stringify([id, msg]);
}
function EncodeUriMsg(msg) {
    return encodeURIComponent(JSON.stringify(msg));
}
