var State;
(function (State) {
    State[State["IN_NONE"] = 0] = "IN_NONE";
    State[State["IN_LOGIN"] = 1] = "IN_LOGIN";
    State[State["IN_LOBBY"] = 2] = "IN_LOBBY";
    State[State["IN_ROOM"] = 3] = "IN_ROOM";
    State[State["IN_READY"] = 4] = "IN_READY";
    State[State["IN_GAME"] = 5] = "IN_GAME";
    State[State["IN_BLANCE"] = 6] = "IN_BLANCE";
})(State || (State = {}));
var JClient = (function () {
    function JClient(uid) {
        this.state = State.IN_NONE;
        this.info = {};
        this.requestCreateRoom = false;
        this.native = Client.Get(uid);
        if (!this.native)
            return null;
        this.uid = uid;
        var self = this;
        this.native.OnMessage = function (msg) { self.OnMessage(msg); };
        this.native.OnConnected = function () { self.OnConnected(); };
        this.native.OnDisconected = function () { self.OnDisconected(); };
    }
    JClient.prototype.Send = function (msg) {
        if (!this.native) {
            LogError("native client is null");
            return;
        }
        var nstring = new NString();
        nstring.Append(msg);
        this.SendNString(nstring);
    };
    JClient.prototype.SendNString = function (msg) {
        this.native.Send(msg.Get());
        msg.Append("\n");
        if (this.room && this.room.recoder_stream)
            this.room.recoder_stream.Write(msg.Get());
    };
    JClient.prototype.CloseOnSendEnd = function () {
        if (this.native)
            this.native.CloseOnSendEnd();
    };
    JClient.prototype.CloseTimeOut = function (time) {
        gServer.AddTask(new Task(this, this, function (sender, arg) {
            sender.Disconnect();
        }, time));
    };
    JClient.prototype.OnMessage = function (msg) {
        try {
            var json = JSON.parse(msg);
            this.DispatchMessage(json);
        }
        catch (e) {
            LogInfo(msg);
            PrintError("parse message error:", e);
            this.native.Disconnect();
        }
    };
    JClient.prototype.OnConnected = function () {
        this.state = State.IN_LOGIN;
        this.requestCreateRoom = false;
        this.RegisterAllMessage();
    };
    JClient.prototype.OnDisconected = function () {
        this.LeaveRoom();
        this.native = null;
        this.uid = 0;
        this.info = null;
        this.state = State.IN_NONE;
        this.room = null;
        this.player = null;
    };
    JClient.prototype.RegisterAllMessage = function () {
        this.m_MessageCallback = {};
        this.m_MessageCallback[CLIENT_MSG.CM_ENTER_ROOM] = this.EnterRoom;
        this.m_MessageCallback[CLIENT_MSG.CM_LEAVE_ROOM] = this.LeaveRoom;
        this.m_MessageCallback[CLIENT_MSG.CM_READY_GAME] = this.ReadyGame;
        this.m_MessageCallback[CLIENT_MSG.CM_CHU_PAI] = this.ChuPai;
        this.m_MessageCallback[CLIENT_MSG.CM_RESPON_CHU_PAI] = this.ResponseChuPai;
        this.m_MessageCallback[CLIENT_MSG.CM_HUAN_PAI] = this.HuanPai;
        this.m_MessageCallback[CLIENT_MSG.CM_MAI_ZHUANG] = this.MaiZhuang;
        this.m_MessageCallback[CLIENT_MSG.CM_BROADCAST] = this.Broadcast;
        this.m_MessageCallback[CLIENT_MSG.CM_DISMISS_GAME] = this.GameLeave;
        this.m_MessageCallback[CLIENT_MSG.CM_CHECK_IN_ROOM] = this.CheckInRoom;
    };
    JClient.prototype.DispatchMessage = function (msg) {
        var hander = this.m_MessageCallback[msg[0]];
        if (hander)
            hander.call(this, msg[1]);
        else {
            LogError("msg hander is null id : " + msg.id);
            this.native.Disconnect();
        }
    };
    JClient.prototype.Disconnect = function () {
        if (this.native)
            this.native.Disconnect();
    };
    JClient.prototype.CheckUserState = function (unionid, roomid, call_back) {
        var uid = Room.CheckRoomEnter(roomid, unionid);
        if (uid === null)
            call_back({});
        else
            call_back({
                error: "ERROR_USER_STATE_INROOM",
                msg: uid
            });
    };
    JClient.prototype.EnterRoom = function (msg) {
        if (this.room) {
            this.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM, {
                error: "is in room roomid:" + this.room.uid
            }));
            return;
        }
        var roomid = msg.roomid;
        var unionid = msg.unionid;
        this.info = msg;
        if (!unionid || !roomid) {
            this.native.Disconnect();
            return;
        }
        if (this.requestCreateRoom)
            return;
        var client = this;
        this.CheckUserState(unionid, roomid, function (result) {
            if (result.error) {
                client.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM, result));
                return;
            }
            var room = Room.Get(roomid);
            if (room) {
                client.state = State.IN_ROOM;
                client.room = room;
                var ret = room.ClientJoin(client);
                if (ret != null) {
                    client.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM, {
                        error: ret
                    }));
                    return;
                }
            }
            else {
                PostJson(INFO_SERVER_URL + "getRoomCard", {
                    token: INFO_ACCESS_TOKEN,
                    roomid: roomid
                }, function (state, cardinfo) {
                    client.requestCreateRoom = false;
                    var json = JSON.parse(cardinfo);
                    if (state == 200 && !json.error) {
                        if (client.native == null) {
                            LogError("on create room but client is disconnect!!!");
                            return;
                        }
                        var room_card = json;
                        if (room_card.canUseCount <= 0) {
                            client.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM, {
                                error: "room card is used"
                            }));
                            return;
                        }
                        var room = Room.Create(roomid, room_card);
                        client.state = State.IN_ROOM;
                        client.room = room;
                        room.ClientJoin(client);
                    }
                    else {
                        client.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM, {
                            error: "room not found:" + roomid
                        }));
                        client.native.Disconnect();
                    }
                });
            }
        });
    };
    JClient.prototype.CheckInRoom = function (msg) {
        this.Send(CreateMsg(SERVER_MSG.SM_CHECK_IN_ROOM, { roomid: Room.CheckRoomEnter(msg.roomid, msg.unionid) }));
    };
    JClient.prototype.LeaveRoom = function () {
        if (this.room)
            this.room.ClientLeave(this);
        this.room = null;
    };
    JClient.prototype.ReadyGame = function (msg) {
        this.state = msg.state;
        this.room.ClientReady(this, this.state);
    };
    JClient.prototype.SetReplayState = function () {
        this.state = State.IN_ROOM;
    };
    JClient.prototype.Ready = function () {
        return (this.state == State.IN_READY);
    };
    JClient.prototype.ChuPai = function (msg) {
        this.room.ClientChuPai(this.player, msg);
    };
    JClient.prototype.ResponseChuPai = function (msg) {
        this.room.ClientResponseChuPai(this, msg);
    };
    JClient.prototype.HuanPai = function (msg) {
        this.room.ClientHuanPai(this, msg);
    };
    JClient.prototype.MaiZhuang = function (msg) {
        this.room.ClientMaiZhuang(this, msg);
    };
    JClient.prototype.Broadcast = function (msg) {
        if (this.room)
            this.room.ClientBroadcast(this, msg);
    };
    JClient.prototype.GameLeave = function (msg) {
        if (this.room)
            this.room.GameLeave(this, msg.dismiss);
    };
    return JClient;
}());
