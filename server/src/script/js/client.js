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
        this.native.Send(msg);
    };
    JClient.prototype.SendNString = function (msg) {
        this.native.SendNString(msg);
    };
    JClient.prototype.OnMessage = function (msg) {
        var json = JSON.parse(msg);
        Debug.Log(CLIENT_MSG[json[0]] + ":" + JSON.stringify(json[1]));
        this.DispatchMessage(json);
    };
    JClient.prototype.OnConnected = function () {
        Debug.Log("OnConnected:" + this.uid);
        this.state = State.IN_LOGIN;
        this.RegisterAllMessage();
    };
    JClient.prototype.OnDisconected = function () {
        Debug.Log("OnDisconected:" + this.uid);
        this.uid = 0;
        this.info = null;
        this.state = State.IN_NONE;
        this.room = null;
        this.player = null;
    };
    JClient.prototype.RegisterAllMessage = function () {
        this.m_MessageCallback = {};
        this.m_MessageCallback[CLIENT_MSG.CM_LOGIN] = this.Login;
        this.m_MessageCallback[CLIENT_MSG.CM_CREATE_ROOM] = this.CreateRoom;
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
            Debug.Log("msg hander is null id : " + msg.id);
        }
    };
    JClient.prototype.Login = function (msg) {
        Debug.Log("client login openid:" + msg.openid);
        var send_msg = {
            uid: this.uid
        };
        this.info.openid = msg.openid;
        this.state = State.IN_LOBBY;
        this.Send(CreateMsg(SERVER_MSG.SM_LOGIN, send_msg));
    };
    JClient.prototype.CreateRoom = function (msg) {
        var room = Room.Create();
        this.Send(CreateMsg(SERVER_MSG.SM_CREATE_ROOM, {
            room_uid: room.uid,
            self: msg.self
        }));
    };
    JClient.prototype.EnterRoom = function (msg) {
        Debug.Log("EnterRoom:" + this.uid + " room_id:" + msg.room_uid);
        var room_uid = msg.room_uid;
        var room = Room.Get(room_uid);
        if (room) {
            this.state = State.IN_ROOM;
            this.room = room;
            room.ClientJoin(this);
        }
        else {
            this.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM, {
                error: "room not found:" + room_uid
            }));
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
        this.room.ClientChuPai(this, msg);
    };
    JClient.prototype.ResponseChuPai = function (msg) {
        this.room.ClientResponseChuPai(this, msg);
    };
    JClient.prototype.HuanPai = function (msg) {
        this.room.ClientHuanPai(this, msg);
    };
    return JClient;
}());
