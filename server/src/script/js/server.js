var JServer = (function () {
    function JServer() {
        this.native = Server.Get();
        this.native.OnAccept = this.OnAccept;
    }
    JServer.prototype.OnAccept = function (uid) {
        Debug.Log("accept new client uid:" + uid);
        var client = new JClient(uid);
    };
    JServer.Start = function () {
        new JServer();
    };
    return JServer;
}());
