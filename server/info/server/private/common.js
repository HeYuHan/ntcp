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
    RandomInt.prototype.Get = function () {
        if (this.repeat) {
            var range = this.max - this.min;
            return Math.floor(Math.random() * range) + this.min;
        }
        else {
            if (this.recoders.length == 0)
                throw "random recoder is empty";
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
    RandomInt.prototype.ReleaseValue = function (value) {
        if (!this.repeat) {
            var index = this.recoders.indexOf(value);
            if (index >= 0)
                this.recoders.splice(index, 1);
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
module.exports={
    RandomInt:RandomInt
};