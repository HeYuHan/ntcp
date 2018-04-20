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
        var nstring = new NString();
        nstring.Append(msg);
        this.SendNString(nstring);
    };
    JClient.prototype.SendNString = function (msg) {
        this.native.SendNString(msg);
        msg.Append("\n");
        if (this.room && this.room.recoder_stream)
            this.room.recoder_stream.WriteNString(msg);
    };
    JClient.prototype.OnMessage = function (msg) {
        var json = JSON.parse(msg);
        LogInfo(CLIENT_MSG[json[0]] + ":" + JSON.stringify(json[1]));
        try {
            this.DispatchMessage(json);
        }
        catch (e) {
            PrintError("parse message error:", e);
            this.native.Disconnect();
        }
    };
    JClient.prototype.OnConnected = function () {
        LogInfo("OnConnected:" + this.uid);
        this.state = State.IN_LOGIN;
        this.RegisterAllMessage();
    };
    JClient.prototype.OnDisconected = function () {
        LogInfo("OnDisconected:" + this.uid);
        try {
            this.LeaveRoom(null);
        }
        catch (e) {
            PrintError("leave room error:", e);
        }
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
    JClient.prototype.EnterRoom = function (msg) {
        var roomid = msg.roomid;
        var openid = msg.openid;
        this.info = this.info || {};
        this.info.openid = openid;
        if (!openid || !roomid) {
            this.native.Disconnect();
            return;
        }
        var client = this;
        var room = Room.Get(roomid);
        if (room) {
            client.state = State.IN_ROOM;
            client.room = room;
            room.ClientJoin(client);
        }
        else {
            var http = new JHttp();
            http.OnResponse = function (state, msg) {
                LogInfo("check room ret:" + msg);
                var json = JSON.parse(msg);
                if (state == 200 && !json.error) {
                    var room = Room.Create(roomid, json);
                    client.state = State.IN_ROOM;
                    client.room = room;
                    room.ClientJoin(client);
                }
                else {
                    client.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM, {
                        error: "room not found:" + roomid
                    }));
                }
            };
            http.PostJson(INFO_SERVER_URL + "getRoomCard", {
                token: INFO_ACCESS_TOKEN,
                roomid: roomid
            });
        }
    };
    JClient.prototype.LeaveRoom = function (msg) {
        if (this.room)
            this.room.ClientLeave(this);
        this.room = null;
    };
    JClient.prototype.ReadyGame = function (msg) {
        this.state = msg.state;
        this.room.ClientReady(this, this.state);
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
    return JClient;
}());
