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
        this.wen_qiang_count = 0;
        this.di_hu_score = 0;
        this.totle_socre = 0;
        this.hu_type_score = 0;
        this.wen_qiang_score = 0;
        this.hu_pai = false;
    }
    HuPaiInfo.prototype.Print = function () {
        Debug.Log("------------ming ke---------------");
        Pai.PrintDetailArray(this.ming_ke_array);
        Debug.Log("------------an ke---------------");
        Pai.PrintDetailArray(this.an_ke_array);
        Debug.Log("------------ming gang---------------");
        Pai.PrintDetailArray(this.ming_gang_array);
        Debug.Log("------------an gang---------------");
        Pai.PrintDetailArray(this.an_gang_array);
        Debug.Log("------------sun zi---------------");
        Pai.PrintDetailArray(this.sun_zi_array);
        Debug.Log("------------dui zi---------------");
        Pai.PrintDetailArray(this.dui_zi_array);
        Debug.Log("------------xi---------------");
        Pai.PrintDetailArray(this.xi_array);
        Debug.Log("wen qiang:" + this.wen_qiang_count);
        Debug.Log("HuType:" + HuType[this.hu_type]);
        Debug.Log("HuPaiType:" + this.hu_pai_type);
        Debug.Log("dihu:" + this.di_hu_score);
        Debug.Log("wenqiang:" + this.wen_qiang_score);
        Debug.Log("type:" + this.hu_type_score);
        Debug.Log("totle:" + this.totle_socre);
        Debug.Log("-------------end--------------\n\n");
    };
    HuPaiInfo.SortInfo = function (a, b) {
        return a.totle_socre - b.totle_socre;
    };
    HuPaiInfo.prototype.CaculateTotleScore = function () {
        this.totle_socre = this.di_hu_score + this.wen_qiang_score + this.hu_type_score;
    };
    HuPaiInfo.prototype.CaculateOtherScore = function (hu_pai) {
        if (hu_pai == null)
            return;
        for (var i = 0; i < this.sun_zi_array.length; i++) {
            var d = this.sun_zi_array[i];
            if (d.pai.value == 1 && d.pai.type == PaiType.PAI_TONG) {
                this.wen_qiang_count++;
            }
            if ((d.pai.value == hu_pai.pai.value - 1) && d.pai.type == hu_pai.pai.type) {
                if (this.hu_pai_type == 0)
                    this.hu_pai_type |= HuPaiType.YA_ZI;
            }
            else if ((d.pai.value == hu_pai.pai.value || (d.pai.value == hu_pai.pai.value - 2)) && d.pai.type == hu_pai.pai.type) {
                if (this.hu_pai_type == 0)
                    this.hu_pai_type |= HuPaiType.BIAN_ZHANG;
            }
        }
        for (var i = 0; i < this.dui_zi_array.length; i++) {
            var d = this.dui_zi_array[i];
            if (d.pai.value == hu_pai.pai.value && d.pai.type == hu_pai.pai.type) {
                this.hu_pai_type |= HuPaiType.DANG_DIAO;
            }
        }
        if (this.wen_qiang_count > 0)
            this.hu_pai_type |= HuPaiType.WEN_QIAN;
        if (this.wen_qiang_count > 0 && (this.an_ke_array.length + this.ming_ke_array.length) > 0 && this.sun_zi_array.length == this.wen_qiang_count) {
            this.hu_type = HuType.PIAO_HU;
        }
        else if (this.sun_zi_array.length == 7) {
            this.hu_type = HuType.QING_HU;
        }
        else {
            this.hu_type = HuType.TAZI_HU;
        }
        if (this.wen_qiang_count > 0) {
            switch (this.wen_qiang_count) {
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
        if (this.hu_pai_type > 0) {
            this.hu_type_score = 10;
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
        Debug.Log(this.ToString());
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
    Pai.DetailToNumberArray = function (details) {
        var ret = [];
        for (var i = 0; i < details.length; i++) {
            ret.push(details[i].pai.num);
        }
        return ret;
    };
    Pai.PrintDetailArray = function (details) {
        var msg = "";
        for (var i = 0; i < details.length; i++) {
            msg += details[i].pai.ToString();
        }
        Debug.Log(msg);
    };
    Pai.Equal = function (n1, n2) {
        if (n1 == n2)
            return true;
        var pai1 = Pai.GetPaiByNumber(n1);
        var pai2 = Pai.GetPaiByNumber(n2);
        return (pai1.value == pai2.value && pai1.type == pai2.type);
    };
    Pai.IsLaoJiang = function (ret) {
        if (ret.type == PaiType.PAI_HONG || ret.type == PaiType.PAI_QIAN || ret.type == PaiType.PAI_BAI || (ret.type == PaiType.PAI_WANG && ret.value == 9)) {
            return true;
        }
        return false;
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
    }
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
        this.pais = new RandomInt(1, 121, false);
        this.includ_xipai = this.includ_xipai;
    }
    PaiDui.prototype.MoJiangPai = function () {
        this.jiang_pai.push(this.pais.Get());
        this.jiang_pai.push(this.pais.Get());
        if (this.includ_xipai) {
            for (var i = 121; i < 126; i++) {
                this.pais.Insert(i);
            }
        }
        this.CaculateJiangPaiType();
    };
    PaiDui.prototype.GetPaiDetail = function (num) {
        var ret = this.pai_detail_array[num];
        if (!ret) {
            ret = new PaiDetail();
            ret.pai = Pai.GetPaiByNumber(num);
            ret.is_jiang = this.IsJiangPai(num);
            ret.is_laojiang = Pai.IsLaoJiang(ret.pai);
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
        try {
            return this.pais.Get();
        }
        catch (error) {
            return 0;
        }
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
        var ret = 1;
        switch (jiang_pai_type) {
            case JiangType.HIGH_SAME:
                {
                    ret = 8;
                    break;
                }
            case JiangType.HIGH_NORMAL:
                {
                    if (pai_detail.is_laojiang)
                        ret = 4;
                    else
                        ret = 2;
                    break;
                }
            case JiangType.NORMAL_SAME:
                {
                    ret = 4;
                    break;
                }
            case JiangType.NORMAL:
                {
                    ret = 2;
                    break;
                }
        }
        if (pai_detail.is_jiang) {
            if (type == HuPaiRateType.MING_KE) {
                ret *= 2;
            }
            else if (type == HuPaiRateType.AN_KE) {
                ret *= 3;
            }
        }
        return ret;
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
    PaiDui.prototype.CaculateDiHu = function (shou_pai, di_pai, an_gang, sort) {
        if (sort) {
            shou_pai.sort(PaiDui.SortPaiArray);
            di_pai.sort(PaiDui.SortPaiArray);
        }
        var ming_ke_array = [];
        var an_ke_array = [];
        var ming_gang_array = [];
        var an_gang_array = [];
        var xi_pai_array = [];
        var sun_zi_array = [];
        var dui_zi_array = [];
        var temp_array = [];
        for (var i = 0; i < shou_pai.length; i++) {
            var detail = this.GetPaiDetail(shou_pai[i]);
            if (detail.pai.type == PaiType.PAI_XI) {
                xi_pai_array.push(detail);
                continue;
            }
            temp_array.push(detail);
            if (temp_array.length > 1 && i < shou_pai.length - 1) {
                if (temp_array[0].pai.value == temp_array[1].pai.value) {
                    var detail2 = this.GetPaiDetail(shou_pai[i + 1]);
                    if (temp_array[0].pai.value == detail2.pai.value) {
                        an_ke_array.push(temp_array[0]);
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
                else if ((temp_array[0].pai.value + 1) == temp_array[1].pai.value && temp_array[0].pai.type == temp_array[1].pai.type) {
                    var detail2 = this.GetPaiDetail(shou_pai[i + 1]);
                    if ((temp_array[0].pai.value == detail2.pai.value - 2) && detail2.pai.type == temp_array[0].pai.type) {
                        sun_zi_array.push(temp_array[0]);
                        temp_array = [];
                        i++;
                        continue;
                    }
                }
                else {
                    temp_array = [];
                    continue;
                }
            }
            else if (temp_array.length > 1 && Pai.Equal(temp_array[0].pai.num, temp_array[1].pai.num)) {
                dui_zi_array.push(temp_array[0]);
                temp_array = [];
                continue;
            }
        }
        temp_array = [];
        for (var i = 0; di_pai != null && i < di_pai.length; i++) {
            var detail = this.GetPaiDetail(shou_pai[i]);
            if (detail.pai.type == PaiType.PAI_XI) {
                xi_pai_array.push(detail);
                continue;
            }
            temp_array.push(detail);
            if (temp_array.length > 2 && i < shou_pai.length - 1) {
                if (temp_array[0].pai.value == temp_array[1].pai.value && temp_array[0].pai.value == temp_array[2].pai.value) {
                    var detail2 = this.GetPaiDetail(shou_pai[i + 1]);
                    if (temp_array[0].pai.value == detail2.pai.value) {
                        if (an_gang.indexOf(detail2.pai.value)) {
                            an_gang_array.push(temp_array[0]);
                        }
                        else {
                            ming_gang_array.push(temp_array[0]);
                        }
                        temp_array = [];
                        i++;
                        continue;
                    }
                    else {
                        ming_ke_array.push(temp_array[0]);
                        temp_array = [];
                    }
                }
                else {
                    temp_array = [];
                    continue;
                }
            }
        }
        var di_hu = 0;
        var ming_ke_hu = 0;
        var an_ke_hu = 0;
        var ming_gang_hu = 0;
        var an_gang_hu = 0;
        var ming_ke_base = 2;
        var an_ke_base = 4;
        var ming_gang_base = 8;
        var an_gang_base = 12;
        for (var i = 0; i < ming_ke_array.length; i++) {
            var detail = ming_ke_array[i];
            var rate = PaiDui.GetHuPaiRate(this.jiang_pai_type, detail, HuPaiRateType.MING_KE);
            ming_ke_hu += ming_ke_base * rate;
        }
        for (var i = 0; i < an_ke_array.length; i++) {
            var detail = an_ke_array[i];
            var rate = PaiDui.GetHuPaiRate(this.jiang_pai_type, detail, HuPaiRateType.AN_KE);
            an_ke_hu += an_ke_base * rate;
        }
        for (var i = 0; i < ming_gang_array.length; i++) {
            var detail = ming_gang_array[i];
            var rate = PaiDui.GetHuPaiRate(this.jiang_pai_type, detail, HuPaiRateType.MING_GANG);
            ming_gang_hu += ming_gang_base * rate;
        }
        for (var i = 0; i < an_gang_array.length; i++) {
            var detail = an_gang_array[i];
            var rate = PaiDui.GetHuPaiRate(this.jiang_pai_type, detail, HuPaiRateType.AN_GANG);
            an_gang_hu += an_gang_base * rate;
        }
        var di_hu = ming_ke_hu + an_ke_hu + ming_gang_hu + an_gang_hu;
        var ret_info = new HuPaiInfo();
        ret_info.ming_ke_array = ming_ke_array;
        ret_info.an_ke_array = an_ke_array;
        ret_info.ming_gang_array = ming_gang_array;
        ret_info.an_gang_array = an_gang_array;
        ret_info.sun_zi_array = sun_zi_array;
        ret_info.dui_zi_array = dui_zi_array;
        ret_info.di_hu_score = di_hu;
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
            this.win_node.push(win_info2);
        }
    };
    return CheckPaiNode;
}());
