var JServer = (function () {
    function JServer() {
        this.native = Server.Get();
        this.native.OnAccept = this.OnAccept;
        var content = this;
        this.native.OnUpdate = function (t) { content.OnUpdate(t); };
    }
    JServer.prototype.OnAccept = function (uid) {
        LogInfo("accept new client uid:" + uid);
        var client = new JClient(uid);
    };
    JServer.prototype.Init = function (config) {
        return this.native.Init(JSON.stringify(config));
    };
    JServer.prototype.Start = function () {
        return this.native.Start();
    };
    JServer.prototype.OnUpdate = function (frame) {
    };
    return JServer;
}());
