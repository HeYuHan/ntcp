var NString = (function () {
    function NString() {
        this.content = "";
    }
    NString.prototype.Append = function (msg) {
        this.content += msg;
    };
    NString.prototype.Get = function () {
        return this.content;
    };
    return NString;
}());
