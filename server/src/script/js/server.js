var Task = (function () {
    function Task(sender, arg, callback, time_out) {
        this.sender = sender;
        this.arg = arg;
        this.callback = callback;
        this.time_out = time_out;
    }
    Task.prototype.Rest = function () {
        this.time_begin = 0;
    };
    Task.prototype.Call = function () {
        if (this.callback)
            this.callback(this.sender, this.arg);
    };
    Task.prototype.IsTimeOut = function () {
        return this.time_begin > this.time_out;
    };
    return Task;
}());
var JServer = (function () {
    function JServer() {
        this.tasks = [];
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
    JServer.prototype.AddTask = function (task) {
        task.Rest();
        this.tasks.push(task);
    };
    JServer.prototype.OnUpdate = function (frame) {
        for (var i = 0; i < this.tasks.length; i++) {
            this.tasks[i].time_begin += frame;
            if (this.tasks[i].IsTimeOut()) {
                this.tasks[i].Call();
                this.tasks.slice(i, 1);
            }
        }
    };
    return JServer;
}());
