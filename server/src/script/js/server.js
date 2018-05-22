var JServer = (function () {
    function JServer() {
        this.native = Server.Get();
        this.native.OnAccept = this.OnAccept;
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
    return JServer;
}());
