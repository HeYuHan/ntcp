var RoomCard = (function () {
    function RoomCard() {
    }
    return RoomCard;
}());
var ScoreRecoder = (function () {
    function ScoreRecoder() {
    }
    return ScoreRecoder;
}());
var PaiMessageResponse;
(function (PaiMessageResponse) {
    PaiMessageResponse[PaiMessageResponse["RESULT_NONE"] = 0] = "RESULT_NONE";
    PaiMessageResponse[PaiMessageResponse["RESULT_PENG"] = 1] = "RESULT_PENG";
    PaiMessageResponse[PaiMessageResponse["RESULT_GANG"] = 2] = "RESULT_GANG";
    PaiMessageResponse[PaiMessageResponse["RESULT_HU"] = 3] = "RESULT_HU";
    PaiMessageResponse[PaiMessageResponse["RESULT_XI"] = 4] = "RESULT_XI";
    PaiMessageResponse[PaiMessageResponse["RESULT_ANGANG"] = 5] = "RESULT_ANGANG";
})(PaiMessageResponse || (PaiMessageResponse = {}));
var RoomPlayer = (function () {
    function RoomPlayer() {
        this.index = 0;
        this.shou_pai = [];
        this.di_pai = [];
        this.qi_pai = [];
        this.tian_ting = true;
        this.tian_hu = false;
        this.jiao_pai_array = [];
        this.an_gang_array = [];
        this.hu_pai_info = null;
        this.hui_pai = false;
        this.hui_pai_uid = 0;
        this.result_msg = null;
        this.maizhuang = false;
    }
    RoomPlayer.prototype.AddDiPais = function (pais) {
        if (typeof (pais) == "number") {
            this.di_pai.push(pais);
        }
        for (var i = 0; i < pais.length; i++) {
            this.di_pai.push(pais[i]);
        }
    };
    RoomPlayer.prototype.AddQiPais = function (pais) {
        if (typeof (pais) == "number") {
            this.qi_pai.push(pais);
        }
        for (var i = 0; i < pais.length; i++) {
            this.qi_pai.push(pais[i]);
        }
    };
    RoomPlayer.prototype.SetPlayerInfo = function (client, unionid) {
        this.uid = client.uid;
        this.client = client;
        this.unionid = unionid;
        client.player = this;
        client.state = State.IN_GAME;
    };
    RoomPlayer.prototype.SortPai = function () {
        this.shou_pai.sort();
    };
    RoomPlayer.prototype.MoPai = function (pai) {
        this.shou_pai.push(pai);
    };
    RoomPlayer.prototype.ChuPai = function (value) {
        var index = this.shou_pai.indexOf(value);
        if (index >= 0) {
            this.shou_pai.splice(index, 1);
            return true;
        }
        return false;
    };
    RoomPlayer.prototype.GetShouPaiSize = function () {
        return this.shou_pai.length;
    };
    RoomPlayer.prototype.PrintShouPai = function () {
        var msg = "";
        for (var i = 0; i < this.shou_pai.length; i++) {
            msg += (this.shou_pai[i] + ",");
        }
        LogInfo("palyer index:" + this.index + " shou pai:" + msg);
    };
    RoomPlayer.prototype.Peng = function (value) {
        var temp_shou = [];
        var temp_di = [];
        for (var i = 0; i < this.shou_pai.length; i++) {
            var pai = this.shou_pai[i];
            if (temp_di.length < 2 && Pai.Equal(pai, value)) {
                temp_di.push(pai);
            }
            else {
                temp_shou.push(pai);
            }
        }
        if (temp_di.length > 1) {
            temp_di.push(value);
            this.AddDiPais(temp_di);
            this.shou_pai = temp_shou;
            return true;
        }
        return false;
    };
    RoomPlayer.prototype.AnGang = function (value) {
        this.shou_pai.sort(Pai.SortNumber);
        var first_gan_index = -1;
        for (var i = 0; i < this.shou_pai.length - 3; i++) {
            if (Pai.Equal(this.shou_pai[i], this.shou_pai[i + 1]) && Pai.Equal(this.shou_pai[i + 1], this.shou_pai[i + 2]) && Pai.Equal(this.shou_pai[i + 2], this.shou_pai[i + 3])) {
                if (Pai.Equal(this.shou_pai[i], value) || Pai.Equal(this.shou_pai[i + 1], value) || Pai.Equal(this.shou_pai[i + 2], value) || Pai.Equal(this.shou_pai[i + 3], value)) {
                    this.AddDiPais([this.shou_pai[i], this.shou_pai[i + 1], this.shou_pai[i + 2], this.shou_pai[i + 3]]);
                    this.an_gang_array.push(Pai.GetPaiByNumber(this.shou_pai[i]));
                    this.shou_pai.splice(i, 4);
                    return true;
                }
                else if (first_gan_index == -1) {
                    first_gan_index = i;
                }
            }
        }
        if (first_gan_index != -1) {
            this.an_gang_array.push(Pai.GetPaiByNumber(this.shou_pai[first_gan_index]));
            this.AddDiPais([this.shou_pai[first_gan_index], this.shou_pai[first_gan_index + 1], this.shou_pai[first_gan_index + 2], this.shou_pai[first_gan_index + 3]]);
            this.shou_pai.splice(first_gan_index, 4);
            return true;
        }
        return false;
    };
    RoomPlayer.prototype.Gang = function (value) {
        var temp_shou = [];
        var temp_di = [];
        for (var i = 0; i < this.shou_pai.length; i++) {
            var pai = this.shou_pai[i];
            if (temp_di.length < 3 && Pai.Equal(pai, value)) {
                temp_di.push(pai);
            }
            else {
                temp_shou.push(pai);
            }
        }
        if (temp_di.length > 2) {
            temp_di.push(value);
            this.AddDiPais(temp_di);
            this.shou_pai = temp_shou;
            return true;
        }
        for (var i = 0; i < this.di_pai.length; i++) {
            var pai = this.di_pai[i];
            if (Pai.Equal(pai, value)) {
                var index = this.shou_pai.indexOf(value);
                if (index >= 0) {
                    this.shou_pai.splice(index, 1);
                    this.di_pai.push(value);
                    return true;
                }
                return false;
            }
        }
        return false;
    };
    RoomPlayer.prototype.CaculateHu = function (pais) {
        this.hui_pai = false;
        this.di_pai.sort(Pai.SortNumber);
        this.hu_pai_info = pais.CaculateDiHu(this.shou_pai, this.di_pai, this.an_gang_array, this.jiao_pai_array);
        this.hu_pai_info.CaculateTotleScore(null);
    };
    RoomPlayer.prototype.Hu = function (pai, pais) {
        var ret = false;
        var caulater = new CheckPaiNode();
        for (var i = 0; i < this.shou_pai.length; i++) {
            caulater.AddOriginPai(pais.GetPaiDetail(this.shou_pai[i]));
        }
        caulater.AddOriginPai(pais.GetPaiDetail(pai));
        var result_array = caulater.CheckWin();
        this.hu_pai_info = null;
        this.hui_pai = false;
        ret = result_array != null;
        if (ret) {
            this.hui_pai = true;
            var di_info_array = [];
            this.di_pai.sort(PaiDui.SortPaiArray);
            for (var i = 0; i < result_array.length; i++) {
                var shou = Pai.DetailToNumberArray(result_array[i]);
                var info = pais.CaculateDiHu(shou, this.di_pai, this.an_gang_array, this.jiao_pai_array);
                info.hu_pai_array = shou;
                if (this.tian_ting) {
                    info.hu_pai_type |= HuPaiType.TIANG_TING;
                }
                info.CaculateTotleScore(pais.GetPaiDetail(pai));
                di_info_array.push(info);
            }
            this.hu_pai_info = di_info_array[0];
            for (var i = 1; i < di_info_array.length; i++) {
                if (this.hu_pai_info.totle_socre < di_info_array[i].totle_socre) {
                    this.hu_pai_info = di_info_array[i];
                }
            }
        }
        return ret;
    };
    RoomPlayer.prototype.ZiMo = function (pai, pais) {
        var ret = false;
        var caulater = new CheckPaiNode();
        for (var i = 0; i < this.shou_pai.length; i++) {
            caulater.AddOriginPai(pais.GetPaiDetail(this.shou_pai[i]));
        }
        var result_array = caulater.CheckWin();
        this.hu_pai_info = null;
        this.hui_pai = false;
        ret = result_array.length > 0;
        if (ret) {
            this.tian_hu = pais.GetSize() == (pais.GetMaxSize() - 22 * ROOM_MAX_PLAYER_COUNT - 3);
            LogInfo("tian hu:" + this.tian_hu + " pais.GetSize()" + pais.GetSize());
            this.hui_pai = true;
            var di_info_array = [];
            for (var i = 0; i < result_array.length; i++) {
                var shou = Pai.DetailToNumberArray(result_array[i]);
                var info = pais.CaculateDiHu(shou, this.di_pai, this.an_gang_array, this.jiao_pai_array);
                info.hu_pai_array = shou;
                info.hu_pai_type |= HuPaiType.ZI_MO;
                if (this.tian_hu) {
                    info.hu_pai_type |= HuPaiType.TIANG_HU;
                }
                info.CaculateTotleScore(pai);
                di_info_array.push(info);
            }
            this.hu_pai_info = di_info_array[0];
            for (var i = 1; i < di_info_array.length; i++) {
                if (this.hu_pai_info.totle_socre < di_info_array[i].totle_socre) {
                    this.hu_pai_info = di_info_array[i];
                }
            }
        }
        return ret;
    };
    return RoomPlayer;
}());
var RoomState;
(function (RoomState) {
    RoomState[RoomState["IN_NONE"] = 0] = "IN_NONE";
    RoomState[RoomState["IN_WAIT"] = 1] = "IN_WAIT";
    RoomState[RoomState["IN_PLAY"] = 2] = "IN_PLAY";
    RoomState[RoomState["IN_BLANCE"] = 3] = "IN_BLANCE";
    RoomState[RoomState["IN_RELEASED"] = 4] = "IN_RELEASED";
})(RoomState || (RoomState = {}));
var Room = (function () {
    function Room() {
        this.m_timer = null;
        this.room_card = null;
        this.state = RoomState.IN_NONE;
        this.room_players = [];
        this.pais = null;
        this.m_clients = [];
        this.next_mo_palyer = 0;
        this.next_chu_palyer = 0;
        this.wait_result_players = [];
        this.players_result_msg_count = 0;
        this.wait_result = false;
        this.last_chu_pai = 0;
        this.last_mo_pai = 0;
        this.last_chu_pai_player = null;
        this.last_mo_pai_player = null;
        this.auto_chu_pai_timer = 0;
        this.player_maizhuang_count = 0;
        this.recoder_stream = null;
        this.score_recoder = [];
    }
    Room.Create = function (roomid, info) {
        var room = Room.Get(roomid);
        if (room) {
            return room;
        }
        room = new Room();
        room.uid = roomid;
        room.room_card = info;
        Room.gRoomList.push(room);
        return room;
    };
    Room.Get = function (uid) {
        for (var i = 0; i < Room.gRoomList.length; i++) {
            var room = Room.gRoomList[i];
            if (room.uid == uid)
                return room;
        }
        return null;
    };
    Room.Remove = function (uid) {
        for (var i = 0; i < Room.gRoomList.length; i++) {
            var room = Room.gRoomList[i];
            if (room.uid == uid) {
                Room.gRoomList.splice(i, 1);
                LogInfo("remove room from list:" + uid + " current len:" + this.gRoomList.length);
                return;
            }
        }
    };
    Room.prototype.AddClient = function (client) {
        this.m_clients.push(client);
    };
    Room.prototype.RemoveClient = function (c) {
        for (var i = 0; i < this.m_clients.length; i++) {
            if (this.m_clients[i].uid == c.uid) {
                this.m_clients.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    Room.prototype.Init = function () {
        var self = this;
        this.m_timer.OnUpdate = function (t) { self.OnUpdate(t); };
        this.m_timer.Begin();
    };
    Room.prototype.OnUpdate = function (t) {
        if (this.state != RoomState.IN_PLAY)
            return;
        if (!SET_CHU_PAIT_TIME_OUT)
            return;
        this.auto_chu_pai_timer += t;
        if (this.auto_chu_pai_timer > AUTO_CHU_PAI_TIME) {
            this.auto_chu_pai_timer = 0;
            if (this.wait_result) {
                this.ClientResponseChuPai(null, {}, true);
                LogInfo("auto result");
            }
            else {
                var player = this.room_players[this.next_chu_palyer];
                if (player && player.shou_pai.length > 0) {
                    this.ClientChuPai(player, { pai: player.shou_pai[player.shou_pai.length - 1] });
                    LogInfo("auto chu pai");
                }
            }
        }
    };
    Room.prototype.Clean = function () {
        Room.Remove(this.uid);
        for (var i = 0; i < this.m_clients.length; i++) {
            this.m_clients[i].CloseOnSendEnd();
            this.m_clients[i].room = null;
        }
        this.m_clients = [];
        if (this.m_timer) {
            this.m_timer.Stop();
            this.m_timer.Free();
            this.m_timer = null;
        }
        if (this.recoder_stream) {
            this.recoder_stream.Free();
            this.recoder_stream = null;
        }
        this.room_card = null;
        this.state = RoomState.IN_RELEASED;
    };
    Room.prototype.Release = function (data) {
        if (this.state == RoomState.IN_RELEASED) {
            LogError("room is released");
            return;
        }
        var free_room = this.room_card.canUseCount <= 0 || this.m_clients.length == 0;
        var recoder = [];
        this.score_recoder.push(recoder);
        for (var i = 0; i < this.room_players.length; i++) {
            var score = new ScoreRecoder();
            var player = this.room_players[i];
            score.maizhuang = player.maizhuang;
            score.uid = player.unionid;
            score.score = player.hu_pai_info ? player.hu_pai_info.totle_socre : 0;
            recoder.push(score);
            if (player.client) {
                player.client.SetReplayState();
                player.client.player = null;
            }
        }
        if (free_room) {
            LogInfo("free room scores:" + JSON.stringify(this.score_recoder));
            var room = this;
            PostJson(INFO_SERVER_URL + "useRoomCard", {
                cardid: this.room_card.cardid,
                roomid: this.uid,
                token: INFO_ACCESS_TOKEN,
                scores: this.score_recoder
            }, function (state, msg) {
                try {
                    LogInfo("release room:" + msg);
                    var balance = JSON.parse(msg);
                    var balance2 = [];
                    for (var i = 0; i < room.room_players.length; i++) {
                        var player = room.room_players[i];
                        balance2.push({
                            uid: player.uid,
                            score: balance[player.unionid]
                        });
                    }
                    if (data) {
                        if (room.state == RoomState.IN_BLANCE) {
                            room.BroadCastMessage(CreateMsg(SERVER_MSG.SM_GAME_BALANCE, {
                                data: data,
                                score: balance2,
                                card: room.room_card
                            }));
                        }
                    }
                }
                catch (error) {
                    PrintError("release room error:", error);
                }
                room.Clean();
            });
        }
        if (!free_room && data != null) {
            if (this.state == RoomState.IN_BLANCE) {
                this.BroadCastMessage(CreateMsg(SERVER_MSG.SM_GAME_BALANCE, {
                    data: data,
                    card: this.room_card
                }));
            }
            this.state = RoomState.IN_NONE;
        }
    };
    Room.prototype.GetRoomStateInfo = function (c) {
        var palyers = [];
        for (var i = 0; i < this.room_players.length; i++) {
            var p = this.room_players[i];
            var info = {
                size1: p.GetShouPaiSize(),
                di: p.di_pai,
                qi: p.qi_pai
            };
            if (c.uid = p.uid)
                info.shou = p.shou_pai;
            palyers.push(info);
        }
        return {
            self: c.uid,
            jiang: this.pais.jiang_pai,
            size2: this.pais.GetSize(),
            players: palyers,
            next_player: this.room_players[this.next_chu_palyer].uid
        };
    };
    Room.prototype.ClientJoin = function (c) {
        if (this.state == RoomState.IN_NONE)
            this.state = RoomState.IN_WAIT;
        else if (this.state > RoomState.IN_WAIT) {
            for (var i = 0; i < this.room_players.length; i++) {
                var p = this.room_players[i];
                if (c.info.unionid == p.unionid) {
                    var old_uid = p.uid;
                    p.SetPlayerInfo(c, c.info.unionid);
                    this.BroadCastMessageByPlayer(p, CreateMsg(SERVER_MSG.SM_SYNC_ROOM_STATE, this.GetRoomStateInfo(c)), CreateMsg(SERVER_MSG.SM_ENTER_ROOM, { uid: p.uid, origin: old_uid }));
                    return;
                }
            }
            c.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM, {
                error: "room state error",
                state: RoomState[this.state]
            }));
            return;
        }
        else if (this.m_clients.length == ROOM_MAX_PLAYER_COUNT) {
            c.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM, {
                error: "room full",
                maxclient: ROOM_MAX_PLAYER_COUNT
            }));
            return;
        }
        LogInfo("client enter room openid:" + c.info.unionid);
        this.AddClient(c);
        var all_clients = [];
        for (var i = 0; i < this.m_clients.length; i++) {
            var other = this.m_clients[i];
            all_clients.push({
                uid: other.uid,
                info: other.info,
                state: other.state
            });
        }
        for (var i = 0; i < this.m_clients.length; i++) {
            var other = this.m_clients[i];
            if (other.uid == c.uid) {
                other.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM, {
                    self: c.uid,
                    state: this.state,
                    clients: all_clients
                }));
            }
            else {
                other.Send(CreateMsg(SERVER_MSG.SM_ENTER_ROOM, {
                    state: this.state,
                    clients: all_clients
                }));
            }
        }
    };
    Room.prototype.PrintClientInfo = function () {
        for (var i = 0; i < this.m_clients.length; i++) {
            LogInfo("client " + i + " uid:" + this.m_clients[i].uid);
        }
    };
    Room.prototype.ClientLeave = function (c) {
        this.PrintClientInfo();
        this.RemoveClient(c);
        for (var i = 0; i < this.m_clients.length; i++) {
            this.m_clients[i].Send(CreateMsg(SERVER_MSG.SM_LEAVE_ROOM, { uid: c.uid }));
        }
        if (c.player)
            c.player.client = null;
        if (this.m_clients.length == 0) {
            this.Release(null);
        }
    };
    Room.prototype.ClientReady = function (c, ready) {
        if (this.CheckStartGame())
            return true;
        for (var i = 0; i < this.m_clients.length; i++) {
            this.m_clients[i].Send(CreateMsg(SERVER_MSG.SM_READY_GAME, { uid: c.uid, state: ready }));
        }
        return false;
    };
    Room.prototype.CheckStartGame = function () {
        var len = this.m_clients.length;
        if (len < ROOM_MAX_PLAYER_COUNT || this.state == RoomState.IN_PLAY || this.state == RoomState.IN_BLANCE)
            return false;
        for (var i = 0; i < len; i++) {
            var c = this.m_clients[i];
            if (!c.Ready()) {
                return false;
            }
        }
        if (WRITE_ROOM_RECODER) {
            if (!this.recoder_stream) {
                this.recoder_stream = new AsyncFileWriter(RECODER_PATH + this.room_card.cardid);
                var infos = [];
                for (var i = 0; i < this.m_clients.length; i++) {
                    infos.push([this.m_clients[i].uid, this.m_clients[i].info.unionid]);
                }
                this.recoder_stream.Write(JSON.stringify(infos) + "\n");
            }
        }
        this.StartGame();
        return true;
    };
    Room.prototype.StartGame = function () {
        this.state = RoomState.IN_PLAY;
        this.room_players = [];
        this.next_mo_palyer = 0;
        this.next_chu_palyer = 0;
        this.wait_result_players = [];
        this.players_result_msg_count = 0;
        this.wait_result = false;
        this.last_chu_pai = 0;
        this.last_mo_pai = 0;
        this.last_chu_pai_player = null;
        this.last_mo_pai_player = null;
        this.auto_chu_pai_timer = 0;
        this.player_maizhuang_count = 0;
        for (var i = 0; i < this.m_clients.length; i++) {
            var p = new RoomPlayer();
            p.index = i;
            var c = this.m_clients[i];
            p.SetPlayerInfo(c, c.info.unionid);
            this.room_players.push(p);
        }
        this.pais = new PaiDui(this.room_card.includexi);
        for (var i = 0; i < this.room_players.length; i++) {
            for (var j = 0; j < 22; j++) {
                var pai = this.pais.Get();
                this.room_players[i].MoPai(pai);
            }
        }
        for (var i = 0; i < this.room_players.length; i++) {
            var p = this.room_players[i];
            if (p.client)
                p.client.Send(CreateMsg(SERVER_MSG.SM_START_GAME, { uid: p.uid, shou: p.shou_pai, jiang: this.pais.jiang_pai, size2: this.pais.GetSize() }));
        }
        if (this.m_timer == null) {
            this.m_timer = new Timer(1, true);
            this.m_timer.Begin();
            var room = this;
            this.m_timer.OnUpdate = function (frame) { room.OnUpdate(frame); };
        }
        this.room_card.canUseCount--;
    };
    Room.prototype.CaculateResultPlayers = function (player) {
        this.wait_result = true;
        this.wait_result_players = [];
        this.players_result_msg_count = 0;
        if (player) {
            for (var i = player.index + 1; i < this.room_players.length; i++) {
                if (this.room_players[i].client)
                    this.wait_result_players.push(this.room_players[i]);
            }
            for (var i = 0; i < player.index; i++) {
                if (this.room_players[i].client)
                    this.wait_result_players.push(this.room_players[i]);
            }
        }
        else {
            this.wait_result_players = this.room_players;
        }
    };
    Room.prototype.GetChuPaiPalyer = function () {
        return this.room_players[this.next_chu_palyer];
    };
    Room.prototype.GetMoPaiPlayer = function () {
        return this.room_players[this.next_mo_palyer];
    };
    Room.prototype.AutoUpdateNextPlayer = function () {
        this.next_chu_palyer = this.next_mo_palyer % this.room_players.length;
        this.next_mo_palyer = (this.next_mo_palyer + 1) % this.room_players.length;
    };
    Room.prototype.MoPai = function () {
        this.auto_chu_pai_timer = 0;
        var player = this.room_players[this.next_mo_palyer];
        this.AutoUpdateNextPlayer();
        var pai = 0;
        try {
            pai = this.pais.Get();
        }
        catch (_a) {
            this.BalanceGame();
            return;
        }
        player.MoPai(pai);
        this.last_mo_pai = pai;
        this.last_mo_pai_player = player;
        for (var i = 0; i < this.room_players.length; i++) {
            var p = this.room_players[i];
            if (p.index == player.index) {
                if (p.client)
                    p.client.Send(CreateMsg(SERVER_MSG.SM_MO_PAI, {
                        uid: player.uid,
                        pai: pai,
                        size1: p.GetShouPaiSize(),
                        size2: this.pais.GetSize()
                    }));
            }
            else {
                if (p.client)
                    p.client.Send(CreateMsg(SERVER_MSG.SM_MO_PAI, {
                        uid: player.uid,
                        size1: player.GetShouPaiSize(),
                        size2: this.pais.GetSize()
                    }));
            }
        }
    };
    Room.prototype.ClientChuPai = function (player, msg) {
        var value = msg.pai;
        if (player == null)
            return;
        if (player.index == this.next_chu_palyer) {
            if (!player.ChuPai(value)) {
                if (player.client)
                    player.client.Send(CreateMsg(SERVER_MSG.SM_CHU_PAI, {
                        uid: player.uid,
                        error: "not found : " + value
                    }));
                return;
            }
            ;
            this.auto_chu_pai_timer = 0;
            this.last_chu_pai = value;
            this.last_chu_pai_player = player;
            if (!Pai.Equal(this.last_mo_pai, this.last_chu_pai)) {
                player.tian_ting = false;
            }
            var send_msg1 = CreateMsg(SERVER_MSG.SM_CHU_PAI, {
                uid: player.uid,
                pai: value,
                shou: player.shou_pai
            });
            var send_msg2 = CreateMsg(SERVER_MSG.SM_CHU_PAI, {
                uid: player.uid,
                pai: value,
                size1: player.GetShouPaiSize()
            });
            for (var i = 0; i < this.room_players.length; i++) {
                var p = this.room_players[i];
                if (p.client) {
                    if (p.index == player.index)
                        p.client.Send(send_msg1);
                    else
                        p.client.Send(send_msg2);
                }
            }
            this.CaculateResultPlayers(player);
        }
    };
    Room.prototype.BroadCastMessageByPlayer = function (player, player_msg, other_msg) {
        var nstring = new NString();
        nstring.Append(other_msg);
        for (var i = 0; i < this.room_players.length; i++) {
            var p = this.room_players[i];
            if (p.client) {
                if (p.index == player.index) {
                    p.client.Send(player_msg);
                }
                else {
                    p.client.SendNString(nstring);
                }
            }
        }
        nstring = null;
    };
    Room.prototype.BroadCastMessage = function (msg) {
        var nstring = new NString();
        nstring.Append(msg);
        for (var i = 0; i < this.room_players.length; i++) {
            var p = this.room_players[i];
            if (p.client)
                p.client.SendNString(nstring);
        }
        nstring = null;
    };
    Room.prototype.BalanceGame = function () {
        this.state = RoomState.IN_BLANCE;
        var msgs = [];
        for (var i = 0; i < this.room_players.length; i++) {
            var p = this.room_players[i];
            if (p.client)
                p.client.state = State.IN_BLANCE;
            if (p.hu_pai_info == null) {
                p.CaculateHu(this.pais);
            }
            var msg = {
                uid: p.uid,
                shou: p.shou_pai,
                di: p.di_pai,
                array: p.hu_pai_info.hu_pai_array,
                hu: p.hu_pai_info.totle_socre,
            };
            if (p.hui_pai) {
                msg.uid2 = p.hui_pai_uid;
                msg.type1 = p.hu_pai_info.hu_pai_type,
                    msg.type2 = p.hu_pai_info.hu_type;
            }
            msgs.push(msg);
        }
        this.Release(msgs);
    };
    Room.prototype.ClientMaiZhuang = function (client, msg) {
        if (this.player_maizhuang_count == this.room_players.length || this.state != RoomState.IN_PLAY || !client.player)
            return;
        this.player_maizhuang_count++;
        client.player.maizhuang = msg.maizhuang;
        this.BroadCastMessage(CreateMsg(SERVER_MSG.SM_MAI_ZHUANG, {
            uid: client.uid,
            maizhuang: msg.maizhuang
        }));
        if (this.player_maizhuang_count == this.room_players.length) {
            this.MoPai();
        }
    };
    Room.prototype.ClientResponseChuPai = function (client, msg, time_out) {
        if (time_out === void 0) { time_out = false; }
        if (client && client.player.index == this.next_chu_palyer) {
            if (msg.type == PaiMessageResponse.RESULT_HU) {
                var ret = client.player.ZiMo(this.pais.GetPaiDetail(this.last_mo_pai), this.pais);
                if (ret) {
                    var hu_pai_info = client.player.hu_pai_info;
                    this.BroadCastMessage(CreateMsg(SERVER_MSG.SM_HU_PAI, {
                        uid: client.uid,
                        uid2: client.uid,
                        type1: hu_pai_info.hu_pai_type,
                        type2: hu_pai_info.hu_type,
                        pai: this.last_mo_pai
                    }));
                    this.BalanceGame();
                }
                LogInfo("client zi mo:" + ret + " uid:" + client.uid);
                return;
            }
            else if (msg.type == PaiMessageResponse.RESULT_GANG) {
                var an_gan = client.player.AnGang(this.last_mo_pai);
                if (an_gan || client.player.Gang(this.last_mo_pai)) {
                    this.auto_chu_pai_timer = 0;
                    this.next_mo_palyer = client.player.index;
                    var player_msg = {
                        uid: client.uid,
                        pai: this.last_mo_pai,
                        shou: client.player.shou_pai,
                        di: client.player.di_pai
                    };
                    var other_msg = {
                        uid: client.uid,
                        pai: this.last_mo_pai,
                        di: client.player.di_pai,
                        size1: client.player.GetShouPaiSize()
                    };
                    this.BroadCastMessageByPlayer(client.player, CreateMsg(SERVER_MSG.SM_GANG_PAI, player_msg), CreateMsg(SERVER_MSG.SM_GANG_PAI, other_msg));
                    this.wait_result = false;
                    this.MoPai();
                }
                return;
            }
        }
        if (!this.wait_result)
            return;
        if (msg.type == PaiMessageResponse.RESULT_PENG) {
            if (client.player.Peng(this.last_chu_pai)) {
                this.auto_chu_pai_timer = 0;
                this.next_mo_palyer = client.player.index;
                this.AutoUpdateNextPlayer();
                var player_msg = {
                    uid: client.uid,
                    pai: this.last_chu_pai,
                    shou: client.player.shou_pai,
                    di: client.player.di_pai
                };
                var other_msg = {
                    uid: client.uid,
                    pai: this.last_chu_pai,
                    di: client.player.di_pai,
                    size1: client.player.GetShouPaiSize()
                };
                this.BroadCastMessageByPlayer(client.player, CreateMsg(SERVER_MSG.SM_PENG_PAI, player_msg), CreateMsg(SERVER_MSG.SM_PENG_PAI, other_msg));
                this.wait_result = false;
            }
            return;
        }
        else if (msg.type == PaiMessageResponse.RESULT_GANG) {
            if (client.player.Gang(this.last_chu_pai)) {
                this.auto_chu_pai_timer = 0;
                this.next_mo_palyer = client.player.index;
                var player_msg = {
                    uid: client.uid,
                    pai: this.last_chu_pai,
                    shou: client.player.shou_pai,
                    di: client.player.di_pai
                };
                var other_msg = {
                    uid: client.uid,
                    pai: this.last_chu_pai,
                    di: client.player.di_pai,
                    size1: client.player.GetShouPaiSize()
                };
                this.BroadCastMessageByPlayer(client.player, CreateMsg(SERVER_MSG.SM_GANG_PAI, player_msg), CreateMsg(SERVER_MSG.SM_GANG_PAI, other_msg));
                this.wait_result = false;
                this.MoPai();
            }
            return;
        }
        if (!time_out) {
            var find = false;
            for (var i = 0; i < this.wait_result_players.length; i++) {
                if (client.player.index == this.wait_result_players[i].index) {
                    this.wait_result_players[i].result_msg = msg;
                    this.players_result_msg_count++;
                    find = true;
                    break;
                }
            }
            if (!find && this.wait_result_players.length > 0)
                return;
        }
        for (var i = 0; i < this.wait_result_players.length; i++) {
            var p = this.wait_result_players[i];
            var ret_msg = p.result_msg;
            if (!ret_msg)
                continue;
            if (ret_msg.type == PaiMessageResponse.RESULT_HU) {
                var ret = p.Hu(this.last_chu_pai, this.pais);
                if (ret) {
                    p.MoPai(this.last_chu_pai);
                    var hu_pai_info = p.hu_pai_info;
                    p.hui_pai_uid = this.last_chu_pai_player.uid;
                    var broad_msg = {
                        uid: p.uid,
                        uid2: this.GetChuPaiPalyer().uid,
                        pai: this.last_chu_pai
                    };
                    this.BroadCastMessage(CreateMsg(SERVER_MSG.SM_HU_PAI, broad_msg));
                    this.BalanceGame();
                }
                return;
            }
        }
        if ((this.players_result_msg_count == this.wait_result_players.length) || time_out) {
            if (this.last_chu_pai_player)
                this.last_chu_pai_player.AddQiPais(this.last_chu_pai);
            this.wait_result = false;
            this.MoPai();
            LogInfo("time out:" + time_out);
        }
    };
    Room.prototype.ClientHuanPai = function (client, msg) {
        var player = client.player;
        if (player == null)
            return;
        var old_pais = msg;
        var new_pais = [];
        var ok = true;
        var error_pai = -1;
        if (old_pais.length > 0) {
            for (var i = 0; i < old_pais.length; i++) {
                if (old_pais[i] > 120 && player.ChuPai(old_pais[i])) {
                    var pai = 0;
                    try {
                        pai = this.pais.Get();
                    }
                    catch (_a) {
                        this.BalanceGame();
                        return;
                    }
                    if (pai > 0) {
                        new_pais.push(pai);
                        player.MoPai(pai);
                    }
                    else {
                        error_pai = old_pais[i];
                        ok = false;
                        break;
                    }
                }
                else {
                    error_pai = old_pais[i];
                    ok = false;
                    break;
                }
            }
        }
        else {
            ok = false;
        }
        if (ok) {
            player.AddDiPais(old_pais);
            var self_msg = CreateMsg(SERVER_MSG.SM_HUAN_PAI, {
                uid: client.uid,
                shou: player.shou_pai,
                di: player.di_pai
            });
            var other_msg = CreateMsg(SERVER_MSG.SM_HUAN_PAI, {
                uid: client.uid,
                di: player.di_pai
            });
            this.BroadCastMessageByPlayer(client.player, self_msg, other_msg);
        }
        else {
            client.Send(CreateMsg(SERVER_MSG.SM_HUAN_PAI, { error: "pai not found:" + error_pai }));
        }
    };
    Room.gRoomList = [];
    return Room;
}());
