var ROOM_MAX_PLAYER_COUNT = 2;
var DEFINE_RANDOM_TEST = true;
var INFO_SERVER_URL = "http://127.0.0.1:9800/private/";
var ScriptLoader = (function () {
    function ScriptLoader() {
        this.scripts = {};
    }
    ScriptLoader.prototype.Load = function (path) {
        var state = this.scripts[path] || {};
        if (!(state.ok || state.loading)) {
            state.loading = true;
            this.scripts[path] = state;
            var ok = FileHelper.LoadScript(ScriptLoader.ROOT_PATH + path);
            state.loading = false;
            this.scripts[path].ok = ok;
            Debug.Log("load script " + ok + " from :" + path);
        }
    };
    ScriptLoader.GetInstance = function () {
        if (ScriptLoader.m_Instance == null) {
            ScriptLoader.m_Instance = new ScriptLoader();
        }
        return ScriptLoader.m_Instance;
    };
    ScriptLoader.m_Instance = null;
    return ScriptLoader;
}());
function require(path) {
    ScriptLoader.GetInstance().Load(path);
}
var RandomInt = (function () {
    function RandomInt(min, max, repeat) {
        this.min = min;
        this.max = max;
        this.repeat = repeat;
        if (!this.repeat) {
            this.recoders = [];
            for (var i = min; i < max; i++) {
                this.recoders.push(i);
            }
            if (!DEFINE_RANDOM_TEST) {
                var len = max - min;
                if (len > 1) {
                    for (var i = len - 1; i > 0; --i) {
                        var value = this.recoders[i];
                        var rand_index = Math.floor((Math.random() * this.max)) % i;
                        this.recoders[i] = this.recoders[rand_index];
                        this.recoders[rand_index] = value;
                    }
                }
            }
        }
    }
    RandomInt.prototype.Insert = function (newvalue) {
        if (newvalue >= this.min && newvalue <= this.max)
            return false;
        if (this.recoders.indexOf(newvalue) >= 0)
            return false;
        var index = Math.floor(Math.random() * this.recoders.length);
        var value = this.recoders[index];
        this.recoders[index] = newvalue;
        this.recoders.push(value);
    };
    RandomInt.prototype.Get = function () {
        if (this.repeat) {
            var range = this.max - this.min;
            return Math.floor(Math.random() * range) + this.min;
        }
        else {
            if (this.recoders.length == 0) {
                Debug.Log("random recoder is empty");
                throw "random recoder is empty";
            }
            return this.recoders.pop();
        }
    };
    RandomInt.prototype.PopValue = function (value) {
        for (var i = 0; i < this.recoders.length; i++) {
            if (this.recoders[i] == value) {
                this.recoders.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    RandomInt.prototype.ReleaseValue = function (newvalue) {
        if (newvalue >= this.min && newvalue <= this.max && this.recoders.indexOf(newvalue) < 0) {
            var index = Math.floor(Math.random() * this.recoders.length);
            var value = this.recoders[index];
            this.recoders[index] = newvalue;
            this.recoders.push(value);
        }
    };
    RandomInt.prototype.GetRecoderList = function () {
        if (!this.repeat)
            return this.recoders.slice(0);
        return null;
    };
    RandomInt.prototype.GetRecoderSize = function () {
        if (!this.repeat)
            return this.recoders.length;
        return 0;
    };
    return RandomInt;
}());
if (Server.Platfrom() == 1)
    ScriptLoader.ROOT_PATH = "E:/Share/ntcp/server/src/script/js/";
else
    ScriptLoader.ROOT_PATH = "./js/";
require("server.js");
require("client.js");
require("pai.js");
require("room.js");
require("message_type.js");
var server = new JServer();
var ret = server.Init({
    max_client: 50
});
Debug.Log("init server ret:" + ret);
server.Start();
