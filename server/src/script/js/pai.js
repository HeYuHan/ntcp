var PaiType;
(function (PaiType) {
    PaiType[PaiType["PAI_NONE"] = 0] = "PAI_NONE";
    PaiType[PaiType["PAI_WANG"] = 1] = "PAI_WANG";
    PaiType[PaiType["PAI_TIAO"] = 2] = "PAI_TIAO";
    PaiType[PaiType["PAI_TONG"] = 3] = "PAI_TONG";
    PaiType[PaiType["PAI_HONG"] = 4] = "PAI_HONG";
    PaiType[PaiType["PAI_BAI"] = 5] = "PAI_BAI";
    PaiType[PaiType["PAI_QIAN"] = 6] = "PAI_QIAN";
    PaiType[PaiType["PAI_XI"] = 7] = "PAI_XI";
})(PaiType || (PaiType = {}));
var HuPaiRateType;
(function (HuPaiRateType) {
    HuPaiRateType[HuPaiRateType["MING_KE"] = 1] = "MING_KE";
    HuPaiRateType[HuPaiRateType["AN_KE"] = 2] = "AN_KE";
    HuPaiRateType[HuPaiRateType["MING_GANG"] = 3] = "MING_GANG";
    HuPaiRateType[HuPaiRateType["AN_GANG"] = 4] = "AN_GANG";
    HuPaiRateType[HuPaiRateType["JIAO_PAI"] = 5] = "JIAO_PAI";
})(HuPaiRateType || (HuPaiRateType = {}));
var HuType;
(function (HuType) {
    HuType[HuType["NONE"] = 0] = "NONE";
    HuType[HuType["PIAO_HU"] = 1] = "PIAO_HU";
    HuType[HuType["QING_HU"] = 2] = "QING_HU";
    HuType[HuType["TAZI_HU"] = 3] = "TAZI_HU";
})(HuType || (HuType = {}));
var HuPaiType;
(function (HuPaiType) {
    HuPaiType[HuPaiType["NONE"] = 0] = "NONE";
    HuPaiType[HuPaiType["WEN_QIAN"] = 1] = "WEN_QIAN";
    HuPaiType[HuPaiType["DANG_DIAO"] = 2] = "DANG_DIAO";
    HuPaiType[HuPaiType["YA_ZI"] = 4] = "YA_ZI";
    HuPaiType[HuPaiType["BIAN_ZHANG"] = 8] = "BIAN_ZHANG";
    HuPaiType[HuPaiType["ZI_MO"] = 16] = "ZI_MO";
    HuPaiType[HuPaiType["TIANG_HU"] = 32] = "TIANG_HU";
    HuPaiType[HuPaiType["TIANG_TING"] = 64] = "TIANG_TING";
    HuPaiType[HuPaiType["QIONG_XI"] = 128] = "QIONG_XI";
})(HuPaiType || (HuPaiType = {}));
var HuPaiInfo = (function () {
    function HuPaiInfo() {
        this.hu_type = HuType.NONE;
        this.hu_pai_type = HuPaiType.NONE;
        this.ming_ke_array = [];
        this.an_ke_array = [];
        this.ming_gang_array = [];
        this.an_gang_array = [];
        this.xi_array = [];
        this.sun_zi_array = [];
        this.dui_zi_array = [];
        this.jiao_pai_array = [];
        this.hu_pai_array = [];
        this.di_hu_score = 0;
        this.totle_socre = 0;
        this.wen_qiang_score = 0;
        this.xi_pai_score = 0;
        this.san_long_ju_hu_score = 0;
    }
    HuPaiInfo.prototype.Print = function () {
        LogInfo("------------ming ke---------------");
        Pai.PrintDetailArray(this.ming_ke_array);
        LogInfo("------------an ke---------------");
        Pai.PrintDetailArray(this.an_ke_array);
        LogInfo("------------ming gang---------------");
        Pai.PrintDetailArray(this.ming_gang_array);
        LogInfo("------------an gang---------------");
        Pai.PrintDetailArray(this.an_gang_array);
        LogInfo("------------sun zi---------------");
        Pai.PrintDetailArray(this.sun_zi_array);
        LogInfo("------------dui zi---------------");
        Pai.PrintDetailArray(this.dui_zi_array);
        LogInfo("------------jiao pai---------------");
        Pai.PrintDetailArray(this.jiao_pai_array);
        LogInfo("------------xi---------------");
        Pai.PrintDetailArray(this.xi_array);
        LogInfo("HuType:" + HuType[this.hu_type]);
        LogInfo("HuPaiType:" + this.hu_pai_type);
        LogInfo("dihu:" + this.di_hu_score);
        LogInfo("xi:" + this.xi_pai_score);
        LogInfo("wenqiang:" + this.wen_qiang_score);
        LogInfo("totle:" + this.totle_socre);
        LogInfo("-------------end--------------\n\n");
    };
    HuPaiInfo.SortInfo = function (a, b) {
        return a.totle_socre - b.totle_socre;
    };
    HuPaiInfo.prototype.CaculateTotleScore = function (hu_pai, includ_xipai) {
        var qiong_xi = false;
        switch (this.xi_array.length) {
            case 0:
                qiong_xi = true;
                this.xi_pai_score = 0;
                break;
            case 1:
                this.xi_pai_score = 10;
                break;
            case 2:
                this.xi_pai_score = 30;
                break;
            case 3:
                this.xi_pai_score = 50;
                break;
            case 4:
                this.xi_pai_score = 100;
                break;
            case 5:
                this.xi_pai_score = 200;
                break;
        }
        if (!hu_pai) {
            this.totle_socre = this.di_hu_score + this.san_long_ju_hu_score + this.xi_pai_score;
            this.totle_socre = Math.ceil(this.totle_socre / 10) * 10;
            return;
        }
        if (hu_pai) {
            var wen_qiang_count = 0;
            var temp_hu_pai_type = HuPaiType.NONE;
            for (var i = 0; i < this.dui_zi_array.length; i++) {
                var d = this.dui_zi_array[i];
                if (d.pai.value == hu_pai.pai.value && d.pai.type == hu_pai.pai.type) {
                    temp_hu_pai_type |= HuPaiType.DANG_DIAO;
                }
            }
            var have_bian_zhang = false;
            for (var i = 0; i < this.sun_zi_array.length; i++) {
                var d = this.sun_zi_array[i];
                if (d.pai.type == hu_pai.pai.type && ((d.pai.value == 1 && hu_pai.pai.value == 3) || (hu_pai.pai.value == 7 && d.pai.value == 7))) {
                    have_bian_zhang = true;
                }
                if (d.pai.value == 1 && d.pai.type == PaiType.PAI_TONG) {
                    wen_qiang_count++;
                }
                if (temp_hu_pai_type == HuPaiType.NONE && (d.pai.value == hu_pai.pai.value - 1) && d.pai.type == hu_pai.pai.type) {
                    temp_hu_pai_type |= HuPaiType.YA_ZI;
                }
            }
            if (temp_hu_pai_type == HuPaiType.NONE && have_bian_zhang) {
                temp_hu_pai_type |= HuPaiType.BIAN_ZHANG;
            }
            this.hu_pai_type |= temp_hu_pai_type;
            if (wen_qiang_count > 0) {
                this.hu_pai_type |= HuPaiType.WEN_QIAN;
                switch (wen_qiang_count) {
                    case 1:
                        this.wen_qiang_score = 20;
                        break;
                    case 2:
                        this.wen_qiang_score = 50;
                        break;
                    case 3:
                        this.wen_qiang_score = 100;
                        break;
                    case 4:
                        this.wen_qiang_score = 200;
                        break;
                }
            }
            this.totle_socre = this.di_hu_score + this.san_long_ju_hu_score + this.wen_qiang_score + this.xi_pai_score;
            if (this.hu_pai_type & HuPaiType.DANG_DIAO) {
                this.totle_socre += 10;
            }
            if (this.hu_pai_type & HuPaiType.YA_ZI) {
                this.totle_socre += 10;
            }
            if (this.hu_pai_type & HuPaiType.BIAN_ZHANG) {
                this.totle_socre += 10;
            }
            if (this.hu_pai_type & HuPaiType.ZI_MO) {
                this.totle_socre += 10;
            }
            var socre_rate = 1;
            if (this.hu_pai_type & HuPaiType.TIANG_HU) {
                socre_rate = 4;
            }
            else if (this.hu_pai_type & HuPaiType.TIANG_TING) {
                socre_rate = 2;
            }
            else if (this.hu_pai_type & HuPaiType.QIONG_XI) {
                socre_rate = 2;
            }
            if (this.sun_zi_array.length == 0 || (wen_qiang_count == this.sun_zi_array.length)) {
                this.hu_type = HuType.PIAO_HU;
                this.totle_socre += 50;
                socre_rate *= 2;
            }
            else if (this.sun_zi_array.length == 7) {
                this.hu_type = HuType.QING_HU;
                this.totle_socre += 100;
            }
            else {
                LogInfo("tai zi hu......." + this.totle_socre);
                this.hu_type = HuType.TAZI_HU;
                this.totle_socre += 20;
            }
            if (qiong_xi && includ_xipai) {
                socre_rate *= 2;
                this.hu_pai_type |= HuPaiType.QIONG_XI;
            }
            this.totle_socre = Math.ceil(this.totle_socre / 10) * 10 * socre_rate;
        }
    };
    return HuPaiInfo;
}());
var Pai = (function () {
    function Pai() {
        this.value = 0;
        this.type = PaiType.PAI_NONE;
        this.num = 0;
    }
    Pai.prototype.Print = function () {
        LogInfo(this.ToString());
    };
    Pai.prototype.ToString = function () {
        return "{" + PaiType[this.type] + " " + this.value + "}";
    };
    Pai.GetPaiByNumber = function (num) {
        var pai = Pai.pai_number_arr[num];
        if (!pai) {
            pai = Pai.CreatePai(num);
            pai.num = num;
            Pai.pai_number_arr[num] = pai;
        }
        return pai;
    };
    Pai.SortNumber = function (a, b) {
        var p1 = Pai.GetPaiByNumber(a);
        var p2 = Pai.GetPaiByNumber(b);
        if (p1.type == p2.type) {
            if (p1.value == p2.value) {
                return p1.num - p2.num;
            }
            else
                return p1.value - p2.value;
        }
        else
            return p1.type - p2.type;
    };
    Pai.DetailToNumberArray = function (details) {
        var ret = [];
        for (var i = 0; i < details.length; i++) {
            ret.push(details[i].pai.num);
        }
        return ret;
    };
    Pai.PrintNumberArray = function (nums) {
        var msg = "";
        for (var i = 0; i < nums.length; i++) {
            msg += Pai.GetPaiByNumber(nums[i]).ToString();
        }
        LogInfo(msg);
    };
    Pai.PrintDetailArray = function (details) {
        var msg = "";
        for (var i = 0; i < details.length; i++) {
            msg += details[i].pai.ToString();
        }
        LogInfo(msg);
    };
    Pai.PrintArray = function (pais) {
        var msg = "";
        for (var i = 0; i < pais.length; i++) {
            msg += pais[i].ToString();
        }
        LogInfo(msg);
    };
    Pai.Equal = function (n1, n2) {
        if (n1 == n2)
            return true;
        var pai1 = Pai.GetPaiByNumber(n1);
        var pai2 = Pai.GetPaiByNumber(n2);
        return (pai1.value == pai2.value && pai1.type == pai2.type);
    };
    Pai.Equal2 = function (pai1, pai2) {
        return (pai1.value == pai2.value && pai1.type == pai2.type);
    };
    Pai.IsLaoJiang = function (ret) {
        if (ret.type == PaiType.PAI_HONG || ret.type == PaiType.PAI_QIAN || ret.type == PaiType.PAI_BAI || (ret.type == PaiType.PAI_TIAO && ret.value == 9)) {
            return true;
        }
        return false;
    };
    Pai.ValueToNumber = function (type, value) {
        var ret = 0;
        if (type == PaiType.PAI_HONG)
            return 10;
        if (type == PaiType.PAI_WANG)
            return value;
        if (type == PaiType.PAI_BAI)
            return 50;
        if (type == PaiType.PAI_TIAO)
            return value + 40;
        if (type == PaiType.PAI_QIAN)
            return 90;
        if (type == PaiType.PAI_TONG)
            return value + 80;
        if (type == PaiType.PAI_XI)
            return 121;
        return ret;
    };
    Pai.CreatePai = function (value) {
        var ret = new Pai();
        ret.type = PaiType.PAI_NONE;
        if (value < 41) {
            ret.value = value % 10;
            ret.type = (ret.value == 0) ? PaiType.PAI_HONG : PaiType.PAI_WANG;
            return ret;
        }
        else if (value < 81) {
            ret.value = value % 10;
            ret.type = (ret.value == 0) ? PaiType.PAI_BAI : PaiType.PAI_TIAO;
            return ret;
        }
        else if (value < 121) {
            ret.value = value % 10;
            ret.type = (ret.value == 0) ? PaiType.PAI_QIAN : PaiType.PAI_TONG;
            return ret;
        }
        else {
            ret.value = value % 120;
            ret.type = PaiType.PAI_XI;
            return ret;
        }
    };
    Pai.pai_number_arr = new Array(150);
    return Pai;
}());
var PaiDetail = (function () {
    function PaiDetail() {
        this.pai = null;
        this.is_jiang = false;
        this.is_laojiang = false;
        this.equal_jiang_value = 0;
    }
    PaiDetail.Equal = function (p1, p2) {
        return Pai.Equal2(p1.pai, p2.pai);
    };
    return PaiDetail;
}());
var JiangType;
(function (JiangType) {
    JiangType[JiangType["NONE"] = 0] = "NONE";
    JiangType[JiangType["NORMAL"] = 1] = "NORMAL";
    JiangType[JiangType["NORMAL_SAME"] = 2] = "NORMAL_SAME";
    JiangType[JiangType["HIGH_SAME"] = 3] = "HIGH_SAME";
    JiangType[JiangType["HIGH_NORMAL"] = 4] = "HIGH_NORMAL";
})(JiangType || (JiangType = {}));
var PaiDui = (function () {
    function PaiDui(include_xipai) {
        this.jiang_pai = [];
        this.jiang_pai_type = JiangType.NONE;
        this.pai_detail_array = [];
        this.includ_xipai = false;
        this.jiang_pai[0] = Math.floor(Math.random() * 120) + 1;
        this.jiang_pai[1] = Math.floor(Math.random() * 120) + 1;
        this.pais = new RandomInt(1, include_xipai ? 126 : 121, false);
        this.pais.PopValue(this.jiang_pai[0]);
        this.pais.PopValue(this.jiang_pai[1]);
        this.includ_xipai = include_xipai;
        this.CaculateJiangPaiType();
    }
    PaiDui.prototype.GetMaxSize = function () {
        return this.includ_xipai ? 125 : 120;
    };
    PaiDui.prototype.GetPaiDetail = function (num) {
        var ret = this.pai_detail_array[num];
        if (!ret) {
            ret = new PaiDetail();
            ret.pai = Pai.GetPaiByNumber(num);
            ret.is_jiang = this.IsJiangPai(num);
            ret.is_laojiang = Pai.IsLaoJiang(ret.pai);
            var j1 = Pai.GetPaiByNumber(this.jiang_pai[0]);
            var j2 = Pai.GetPaiByNumber(this.jiang_pai[1]);
            if (j1.value == ret.pai.value)
                ret.equal_jiang_value += 1;
            if (j2.value == ret.pai.value)
                ret.equal_jiang_value += 1;
            this.pai_detail_array[num] = ret;
        }
        return ret;
    };
    PaiDui.prototype.CaculateJiangPaiType = function () {
        var ret1 = Pai.GetPaiByNumber(this.jiang_pai[0]);
        var ret2 = Pai.GetPaiByNumber(this.jiang_pai[1]);
        var lao_jiang = [Pai.IsLaoJiang(ret1), Pai.IsLaoJiang(ret2)];
        var number_equal = ret1.value == ret2.value;
        var equal = number_equal && ret1.type == ret2.type;
        if (lao_jiang[0] && lao_jiang[1]) {
            this.jiang_pai_type = JiangType.HIGH_SAME;
        }
        else if (lao_jiang[0] || lao_jiang[1]) {
            this.jiang_pai_type = JiangType.HIGH_NORMAL;
        }
        else if (equal || number_equal) {
            this.jiang_pai_type = JiangType.NORMAL_SAME;
        }
        else {
            this.jiang_pai_type = JiangType.NORMAL;
        }
    };
    PaiDui.prototype.PopValue = function (num) {
        return this.pais.PopValue(num);
    };
    PaiDui.prototype.Get = function () {
        return this.pais.Get();
    };
    PaiDui.prototype.IsJiangPai = function (pai) {
        var ret = false;
        for (var i = 0; i < 2; i++) {
            if (Pai.Equal(this.jiang_pai[i], pai)) {
                ret = true;
                break;
            }
        }
        return ret;
    };
    PaiDui.prototype.GetSize = function () {
        return this.pais.GetRecoderSize();
    };
    PaiDui.GetHuPaiRate = function (jiang_pai_type, pai_detail, type) {
        var hu = 2;
        var rate = 1;
        if (pai_detail.is_jiang) {
            switch (jiang_pai_type) {
                case JiangType.HIGH_SAME:
                    {
                        rate = 16;
                        break;
                    }
                case JiangType.HIGH_NORMAL:
                    {
                        if (pai_detail.is_laojiang)
                            rate = 8;
                        else
                            rate = 4;
                        break;
                    }
                case JiangType.NORMAL_SAME:
                    {
                        rate = 8;
                        break;
                    }
                case JiangType.NORMAL:
                    {
                        rate = 4;
                        break;
                    }
            }
        }
        else if (pai_detail.is_laojiang) {
            switch (jiang_pai_type) {
                case JiangType.HIGH_SAME:
                    {
                        rate = 8;
                        break;
                    }
                case JiangType.HIGH_NORMAL:
                    {
                        if (pai_detail.is_laojiang)
                            rate = 4;
                        else
                            rate = 1;
                        break;
                    }
                case JiangType.NORMAL_SAME:
                    {
                        rate = 2;
                        break;
                    }
                case JiangType.NORMAL:
                    {
                        rate = 2;
                        break;
                    }
            }
        }
        else if (pai_detail.equal_jiang_value > 0) {
            rate = 2 * pai_detail.equal_jiang_value;
        }
        hu = hu * rate;
        if (pai_detail.is_jiang) {
            if (type == HuPaiRateType.AN_KE) {
                hu *= 3;
            }
            else if (type == HuPaiRateType.JIAO_PAI) {
                hu *= 4;
            }
        }
        else {
            if (type == HuPaiRateType.AN_KE) {
                hu *= 2;
            }
            else if (type == HuPaiRateType.MING_GANG) {
                hu *= 4;
            }
            else if (type == HuPaiRateType.AN_GANG) {
                hu *= 6;
            }
            else if (type == HuPaiRateType.JIAO_PAI) {
                hu *= 8;
            }
        }
        return hu;
    };
    PaiDui.SortPaiArray = function (a, b) {
        var p1 = Pai.GetPaiByNumber(a);
        var p2 = Pai.GetPaiByNumber(b);
        if (p1.type == p2.type) {
            if (p1.value == p2.value) {
                return p1.num - p2.num;
            }
            else
                return p1.value - p2.value;
        }
        else
            return p1.type - p2.type;
    };
    PaiDui.prototype.CaculateDiHu = function (shou_pai, di_pai, an_gang, jiao_pai) {
        var ming_ke_array = [];
        var an_ke_array = [];
        var ming_gang_array = [];
        var an_gang_array = [];
        var xi_pai_array = [];
        var sun_zi_array = [];
        var dui_zi_array = [];
        var jiao_pai_array = [];
        var temp_array = [];
        var san_hua = 0;
        var have_san_hua = false;
        var shou_pai2 = shou_pai.slice(0);
        shou_pai2.sort(Pai.SortNumber);
        for (var i = 0; i < shou_pai2.length; i++) {
            var detail = this.GetPaiDetail(shou_pai2[i]);
            if (detail.pai.type == PaiType.PAI_XI) {
                xi_pai_array.push(detail);
                continue;
            }
            if (detail.is_laojiang) {
                if (detail.pai.type == PaiType.PAI_HONG)
                    san_hua |= 1 << 1;
                else if (detail.pai.type == PaiType.PAI_BAI)
                    san_hua |= 1 << 2;
                else if (detail.pai.type == PaiType.PAI_QIAN)
                    san_hua |= 1 << 3;
            }
            temp_array.push(detail);
            if (temp_array.length > 1 && temp_array[0].pai.type != temp_array[1].pai.type) {
                temp_array.splice(0, 1);
                continue;
            }
            if (temp_array.length < 2)
                continue;
            if (true) {
                if (temp_array.length < 3)
                    continue;
                if (temp_array[2].pai.type != temp_array[0].pai.type) {
                    temp_array = [temp_array[1], temp_array[2]];
                    continue;
                }
                if (temp_array[0].pai.value == temp_array[1].pai.value && temp_array[0].pai.value == temp_array[2].pai.value) {
                    if (jiao_pai.indexOf(temp_array[0].pai.num) < 0)
                        an_ke_array.push(temp_array[0]);
                    temp_array = [];
                    continue;
                }
                else {
                    temp_array = [temp_array[1], temp_array[2]];
                    continue;
                }
            }
        }
        temp_array = [];
        for (var i = 0; i < shou_pai.length; i++) {
            var detail = this.GetPaiDetail(shou_pai[i]);
            if (detail.pai.type == PaiType.PAI_XI) {
                continue;
            }
            temp_array.push(detail);
            if (temp_array.length > 1 && temp_array[0].pai.type != temp_array[1].pai.type) {
                temp_array = [temp_array[1]];
                continue;
            }
            if (temp_array.length < 2)
                continue;
            if (temp_array[0].pai.value == temp_array[1].pai.value) {
                if (i < shou_pai.length - 1) {
                    var detail2 = this.GetPaiDetail(shou_pai[i + 1]);
                    if (PaiDetail.Equal(temp_array[0], detail2)) {
                        temp_array = [];
                        i++;
                        continue;
                    }
                    else {
                        dui_zi_array.push(temp_array[0]);
                        temp_array = [];
                        continue;
                    }
                }
                else {
                    dui_zi_array.push(temp_array[0]);
                    temp_array = [];
                    continue;
                }
            }
            else {
                if (i < shou_pai.length - 1) {
                    var detail2 = this.GetPaiDetail(shou_pai[i + 1]);
                    if ((temp_array[0].pai.value == detail2.pai.value - 2) && detail2.pai.type == temp_array[0].pai.type) {
                        sun_zi_array.push(temp_array[0]);
                        temp_array = [];
                        i++;
                        continue;
                    }
                    else {
                        temp_array = [temp_array[1]];
                        continue;
                    }
                }
                else {
                    temp_array = [temp_array[1]];
                    continue;
                }
            }
        }
        temp_array = [];
        for (var i = 0; di_pai != null && i < di_pai.length; i++) {
            var detail = this.GetPaiDetail(di_pai[i]);
            if (detail.pai.type == PaiType.PAI_XI) {
                xi_pai_array.push(detail);
                continue;
            }
            if (detail.is_laojiang) {
                if (detail.pai.type == PaiType.PAI_HONG)
                    san_hua |= 1 << 1;
                else if (detail.pai.type == PaiType.PAI_BAI)
                    san_hua |= 1 << 2;
                else if (detail.pai.type == PaiType.PAI_QIAN)
                    san_hua |= 1 << 3;
            }
            temp_array.push(detail);
            if (temp_array.length > 1 && temp_array[0].pai.type != temp_array[1].pai.type) {
                temp_array = [temp_array[1]];
                continue;
            }
            if (temp_array.length > 2 && temp_array[0].pai.type != temp_array[2].pai.type) {
                temp_array = [temp_array[2]];
                continue;
            }
            if (temp_array.length < 3)
                continue;
            if (temp_array[0].pai.value == temp_array[1].pai.value && temp_array[0].pai.value == temp_array[2].pai.value) {
                if (i < di_pai.length - 1) {
                    var detail2 = this.GetPaiDetail(di_pai[i + 1]);
                    if (PaiDetail.Equal(temp_array[0], detail2)) {
                        var is_an_gang = false;
                        for (var m = 0; m < an_gang.length; m++) {
                            if (Pai.Equal2(an_gang[m], temp_array[0].pai)) {
                                an_gang_array.push(temp_array[0]);
                                is_an_gang = true;
                                break;
                            }
                        }
                        if (!is_an_gang)
                            ming_gang_array.push(temp_array[0]);
                        temp_array = [];
                        i++;
                        continue;
                    }
                    else {
                        if (jiao_pai.indexOf(temp_array[0].pai.num) < 0)
                            ming_ke_array.push(temp_array[0]);
                        temp_array = [];
                    }
                }
                else {
                    if (jiao_pai.indexOf(temp_array[0].pai.num) < 0)
                        ming_ke_array.push(temp_array[0]);
                    temp_array = [];
                }
            }
            else {
                temp_array = [];
            }
        }
        var di_hu = 0;
        var ming_ke_hu = 0;
        var an_ke_hu = 0;
        var ming_gang_hu = 0;
        var an_gang_hu = 0;
        var jiao_hu = 0;
        have_san_hua = ((san_hua & (1 << 1)) > 0) && ((san_hua & (1 << 2)) > 0) && ((san_hua & (1 << 3)) > 0);
        LogInfo("have san hua:" + have_san_hua);
        for (var i = 0; i < sun_zi_array.length; i++) {
            var detail = sun_zi_array[i];
            for (var k = 0; k < 3; k++) {
                var detail2 = this.GetPaiDetail(detail.pai.num + k);
                var index = ming_ke_array.indexOf(detail2);
                if (index >= 0) {
                    ming_ke_array.splice(index, 1);
                    ming_gang_array.push(detail2);
                }
            }
        }
        for (var i = 0; i < ming_ke_array.length; i++) {
            var detail = ming_ke_array[i];
            var hu = PaiDui.GetHuPaiRate(this.jiang_pai_type, detail, HuPaiRateType.MING_KE);
            ming_ke_hu += hu;
            if (detail.is_laojiang && detail.pai.type != PaiType.PAI_TIAO && have_san_hua)
                ming_ke_hu += hu;
        }
        for (var i = 0; i < an_ke_array.length; i++) {
            var detail = an_ke_array[i];
            var hu = PaiDui.GetHuPaiRate(this.jiang_pai_type, detail, HuPaiRateType.AN_KE);
            an_ke_hu += hu;
            if (detail.is_laojiang && detail.pai.type != PaiType.PAI_TIAO && have_san_hua)
                an_ke_hu += hu;
        }
        for (var i = 0; i < ming_gang_array.length; i++) {
            var detail = ming_gang_array[i];
            var hu = PaiDui.GetHuPaiRate(this.jiang_pai_type, detail, HuPaiRateType.MING_GANG);
            ming_gang_hu += hu;
            if (detail.is_laojiang && detail.pai.type != PaiType.PAI_TIAO && have_san_hua)
                ming_gang_hu += hu;
        }
        for (var i = 0; i < an_gang_array.length; i++) {
            var detail = an_gang_array[i];
            var hu = PaiDui.GetHuPaiRate(this.jiang_pai_type, detail, HuPaiRateType.AN_GANG);
            an_gang_hu += hu;
            if (detail.is_laojiang && detail.pai.type != PaiType.PAI_TIAO && have_san_hua)
                an_gang_hu += hu;
        }
        for (var i = 0; i < jiao_pai.length; i++) {
            var detail = this.GetPaiDetail(jiao_pai[i]);
            jiao_pai_array.push(detail);
            var hu = PaiDui.GetHuPaiRate(this.jiang_pai_type, detail, HuPaiRateType.JIAO_PAI);
            jiao_hu += hu;
            if (detail.is_laojiang && detail.pai.type != PaiType.PAI_TIAO && have_san_hua)
                jiao_hu += hu;
        }
        var di_hu = ming_ke_hu + an_ke_hu + ming_gang_hu + an_gang_hu + jiao_hu;
        var ret_info = new HuPaiInfo();
        ret_info.ming_ke_array = ming_ke_array;
        ret_info.an_ke_array = an_ke_array;
        ret_info.ming_gang_array = ming_gang_array;
        ret_info.an_gang_array = an_gang_array;
        ret_info.sun_zi_array = sun_zi_array;
        ret_info.dui_zi_array = dui_zi_array;
        ret_info.jiao_pai_array = jiao_pai_array;
        ret_info.di_hu_score = di_hu;
        ret_info.xi_array = xi_pai_array;
        return ret_info;
    };
    return PaiDui;
}());
var PaiNode = (function () {
    function PaiNode(detail) {
        this.type = PaiType.PAI_NONE;
        this.value = 0;
        this.check = 1 << 0;
        this.brother = new Array(3);
        this.parent = null;
        this.detail = null;
        this.detail = detail;
        this.type = detail.pai.type;
        this.value = detail.pai.value;
    }
    PaiNode.prototype.Reset = function () {
        this.check = 1 << 0;
        this.parent = null;
        this.brother = new Array(3);
    };
    PaiNode.prototype.ToString = function () {
        return "{" + PaiType[this.type] + "," + this.value + "}";
    };
    return PaiNode;
}());
var CheckPaiNode = (function () {
    function CheckPaiNode() {
        this.pai_list = [];
        this.is_win = false;
        this.last_node = null;
        this.win_node = [];
    }
    CheckPaiNode.prototype.Reset = function () {
        this.is_win = false;
        for (var i = 0; i < this.pai_list.length; i++) {
            this.pai_list[i].Reset();
        }
    };
    CheckPaiNode.prototype.AddPai = function (pai) {
        this.pai_list.push(pai);
    };
    CheckPaiNode.prototype.SetPais = function (pais) {
        this.pai_list = pais;
    };
    CheckPaiNode.prototype.AddOriginPai = function (pai) {
        this.pai_list.push(new PaiNode(pai));
    };
    CheckPaiNode.prototype.Sort = function (p1, p2) {
        if (p1.type == p2.type) {
            if (p1.value == p2.value) {
                return p1.detail.pai.num - p2.detail.pai.num;
            }
            else
                return p1.value - p2.value;
        }
        else
            return p1.type - p2.type;
    };
    CheckPaiNode.prototype.CheckWin = function () {
        if (this.pai_list.length == 2) {
            if (PaiDetail.Equal(this.pai_list[0].detail, this.pai_list[1].detail)) {
                return [[this.pai_list[0].detail, this.pai_list[1].detail]];
            }
            else {
                return [];
            }
        }
        this.win_node = [];
        this.pai_list.sort(this.Sort);
        var msg = "";
        for (var i = 0; i < this.pai_list.length; i++) {
            msg += "[" + this.pai_list[i].type + " " + this.pai_list[i].value + "],";
        }
        var type = 0;
        var num = 0;
        for (var i = 0; i < this.pai_list.length; i++) {
            var p = this.pai_list[i];
            if (p.type != type || p.value != num) {
                type = p.type;
                num = p.value;
                for (var j = i + 1; j < i + 4; j++) {
                    if (j > this.pai_list.length - 1)
                        break;
                    var p2 = this.pai_list[j];
                    if (p2.type == p.type && p2.value == p.value) {
                        this.Reset();
                        p.brother[0] = p2;
                        p.check = 1 << 4;
                        p2.check = 1 << 4;
                        for (var k = 0; k < this.pai_list.length; k++) {
                            if (this.pai_list[k].check == 1 << 0) {
                                this.Check(this.pai_list[k]);
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        }
        return this.win_node;
    };
    CheckPaiNode.prototype.Check = function (p) {
        this.ClearBrother(p);
        switch (p.check) {
            case 1 << 0:
                this.Check1(p);
                break;
            case 1 << 1:
                this.Check2(p);
                break;
            case 1 << 2:
                this.Check3(p);
                break;
            default:
                this.CheckLast(p);
                break;
        }
    };
    CheckPaiNode.prototype.ClearBrother = function (p) {
        for (var i = 0; i < p.brother.length; i++) {
            if (p.brother[i] != null) {
                p.brother[i].check = 1 << 0;
            }
            p.brother[i] = null;
        }
    };
    CheckPaiNode.prototype.Check1 = function (p) {
        p.check = 1 << 1;
        this.CheckBrother(p, 1);
        if (p.brother[0] != null && p.brother[1] != null) {
            this.CheckNext(p);
        }
        else {
            this.Check(p);
        }
    };
    CheckPaiNode.prototype.Check2 = function (p) {
        p.check = 1 << 2;
        this.CheckBrother(p, 2);
        if (p.brother[0] != null && p.brother[1] != null) {
            this.CheckNext(p);
        }
        else {
            this.Check(p);
        }
    };
    CheckPaiNode.prototype.Check3 = function (p) {
        p.check = 1 << 3;
        this.CheckBrother(p, 3);
        if (p.brother[0] != null && p.brother[1] != null && p.brother[2] != null) {
            this.CheckNext(p);
        }
        else {
            this.Check(p);
        }
    };
    CheckPaiNode.prototype.CheckNext = function (p) {
        for (var i = 0; i < this.pai_list.length; i++) {
            if (this.pai_list[i].check == 1 << 0) {
                this.pai_list[i].parent = p;
                this.last_node = this.pai_list[i];
                this.Check(this.last_node);
                return;
            }
        }
        this.GetResult(true);
        if (!this.last_node)
            return;
        this.last_node.check = this.last_node.check << 1;
        this.Check(this.last_node);
    };
    CheckPaiNode.prototype.CheckBrother = function (p, index) {
        switch (index) {
            case 1:
                {
                    for (var i = 0; i < this.pai_list.length; i++) {
                        if (this.pai_list[i].check != (1 << 0))
                            continue;
                        if (this.pai_list[i].type == p.type && this.pai_list[i].value == p.value + 1) {
                            p.brother[0] = this.pai_list[i];
                            p.brother[0].check = 1 << 4;
                            for (var j = i + 1; j < i + 4; j++) {
                                if (j >= this.pai_list.length)
                                    break;
                                if (this.pai_list[j].check != (1 << 0))
                                    continue;
                                if (this.pai_list[j].type == p.type && this.pai_list[j].value == p.value + 2) {
                                    p.brother[1] = this.pai_list[j];
                                    p.brother[1].check = 1 << 4;
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }
                break;
            case 2:
                {
                    for (var i = 0; i < this.pai_list.length; i++) {
                        if (this.pai_list[i].check != (1 << 0))
                            continue;
                        if (i > this.pai_list.length - 2)
                            break;
                        if (this.pai_list[i].type == p.type && this.pai_list[i].value == p.value) {
                            if (this.pai_list[i + 1].type == p.type && this.pai_list[i + 1].value == p.value) {
                                p.brother[0] = this.pai_list[i];
                                p.brother[0].check = 1 << 4;
                                p.brother[1] = this.pai_list[i + 1];
                                p.brother[1].check = 1 << 4;
                                break;
                            }
                        }
                    }
                }
                break;
            case 3:
                {
                    for (var i = 0; i < this.pai_list.length; i++) {
                        if (this.pai_list[i].check != (1 << 0))
                            continue;
                        if (i > this.pai_list.length - 3)
                            break;
                        if (this.pai_list[i].type == p.type && this.pai_list[i].value == p.value) {
                            if (this.pai_list[i + 1].type == p.type && this.pai_list[i + 1].value == p.value) {
                                if (this.pai_list[i + 2].type == p.type && this.pai_list[i + 2].value == p.value) {
                                    p.brother[0] = this.pai_list[i];
                                    p.brother[0].check = 1 << 4;
                                    p.brother[1] = this.pai_list[i + 1];
                                    p.brother[1].check = 1 << 4;
                                    p.brother[2] = this.pai_list[i + 2];
                                    p.brother[2].check = 1 << 4;
                                    break;
                                }
                            }
                        }
                    }
                }
                break;
        }
    };
    CheckPaiNode.prototype.CheckLast = function (p) {
        this.ClearBrother(p);
        if (p.parent != null) {
            p.check = 1 << 0;
            this.last_node = p.parent;
            this.Check(this.last_node);
        }
        else {
            this.GetResult(false);
        }
    };
    CheckPaiNode.SortArray = function (a, b) {
        return b.length - a.length;
    };
    CheckPaiNode.prototype.GetResult = function (tag) {
        this.is_win = tag;
        if (this.is_win) {
            var win_info = [];
            for (var i = 0; i < this.pai_list.length; i++) {
                var p = this.pai_list[i];
                if (p.brother[0] != null) {
                    var temp = [];
                    temp.push(p.detail);
                    for (var j = 0; j < p.brother.length; j++) {
                        if (p.brother[j] != null) {
                            temp.push(p.brother[j].detail);
                        }
                    }
                    win_info.push(temp);
                }
            }
            win_info.sort(CheckPaiNode.SortArray);
            var win_info2 = [];
            for (var i = 0; i < win_info.length; i++) {
                for (var j = 0; j < win_info[i].length; j++) {
                    win_info2.push(win_info[i][j]);
                }
            }
            if (win_info2.length > 0)
                this.win_node.push(win_info2);
        }
    };
    return CheckPaiNode;
}());
