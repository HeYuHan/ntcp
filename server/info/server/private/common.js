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
    RandomInt.prototype.Insert=function(newvalue){
        if( newvalue>= this.min && newvalue <= this.max)return false;
        if(this.recoders.indexOf(newvalue)>=0)return false;
        var index=Math.floor(Math.random()*this.recoders.length);
        var value=this.recoders[index];
        this.recoders[index]=newvalue;
        this.recoders.push(value);
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
        if( newvalue>= this.min && newvalue <= this.max && this.recoders.indexOf(newvalue)<0)
        {
            var index=Math.floor(Math.random()*this.recoders.length);
            var value=this.recoders[index];
            this.recoders[index]=newvalue;
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
module.exports={
    RandomInt:RandomInt
};