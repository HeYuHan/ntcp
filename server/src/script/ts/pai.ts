//筒,条,万,红花,百花,千字,喜字
//1-40 万,红花
//41-80 条,百花
//81-120 筒,千
//121-125 喜
enum PaiType{
    PAI_NONE=0,
    PAI_WANG,
    PAI_TIAO,
    PAI_TONG,
    
    PAI_HONG,
    PAI_BAI,
    PAI_QIAN,
    PAI_XI
}
enum HuPaiRateType{
    MING_KE=1,
    AN_KE,
    MING_GANG,
    AN_GANG
}
//牌型
enum HuType{
    NONE=0,
    PIAO_HU,//飘胡
    QING_HU,//清胡
    TAZI_HU,//塌子胡
}
//胡的那张牌,牌型
enum HuPaiType{
    NONE=0,
    WEN_QIAN=1<<0,
    DANG_DIAO=1<<1,//单吊
    YA_ZI=1<<2,//丫子
    BIAN_ZHANG=1<<3,//边张
    ZI_MO=1<<4,//自摸
    TIANG_HU=1<<5,//天胡
    TIANG_TING=1<<6,//天听
    QIONG_XI=1<<7,//穷喜
}
class HuPaiInfo{
    public hu_type:HuType=HuType.NONE;
    public hu_pai_type:HuPaiType=HuPaiType.NONE;
    public ming_ke_array:Array<PaiDetail>=[];
    public an_ke_array:Array<PaiDetail>=[];
    public ming_gang_array:Array<PaiDetail>=[];
    public an_gang_array:Array<PaiDetail>=[];
    public xi_array:Array<PaiDetail>=[];
    public sun_zi_array:Array<PaiDetail>=[];
    public dui_zi_array:Array<PaiDetail>=[];
    public wen_qiang_count:number=0;
    public di_hu_score:number=0;
    public totle_socre:number=0;
    public hu_type_score:number=0;
    public wen_qiang_score:number=0;
    public hu_pai:boolean=false;
    public Print(){
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
        
        Debug.Log("wen qiang:"+this.wen_qiang_count);
        Debug.Log("HuType:"+HuType[this.hu_type]);
        Debug.Log("HuPaiType:"+this.hu_pai_type);
        Debug.Log("dihu:"+this.di_hu_score);
        Debug.Log("wenqiang:"+this.wen_qiang_score);
        Debug.Log("type:"+this.hu_type_score);
        Debug.Log("totle:"+this.totle_socre);
        Debug.Log("-------------end--------------\n\n");
    }
    public static SortInfo(a:HuPaiInfo,b:HuPaiInfo){
        return a.totle_socre-b.totle_socre;
    }
    public CaculateTotleScore(){
        this.totle_socre=this.di_hu_score+this.wen_qiang_score+this.hu_type_score;
    }
    public CaculateOtherScore(hu_pai:PaiDetail){
        if(hu_pai == null)return;
        for(var i=0;i<this.sun_zi_array.length;i++){
            var d = this.sun_zi_array[i];
            if(d.pai.value==1 && d.pai.type == PaiType.PAI_TONG){
                this.wen_qiang_count++;
            }
            //丫子
            if((d.pai.value == hu_pai.pai.value - 1) && d.pai.type == hu_pai.pai.type){

                if(this.hu_pai_type == 0)this.hu_pai_type |= HuPaiType.YA_ZI;
            }
            //边张
            else if((d.pai.value == hu_pai.pai.value || (d.pai.value == hu_pai.pai.value - 2)) && d.pai.type == hu_pai.pai.type){
                if(this.hu_pai_type == 0)this.hu_pai_type |= HuPaiType.BIAN_ZHANG;
            }
        }
        //单吊
        for(var i=0;i<this.dui_zi_array.length;i++){
            var d=this.dui_zi_array[i];
            if(d.pai.value == hu_pai.pai.value && d.pai.type == hu_pai.pai.type){
                this.hu_pai_type |= HuPaiType.DANG_DIAO;
            }
        }
        if(this.wen_qiang_count>0)this.hu_pai_type |=HuPaiType.WEN_QIAN;
        //飘忽
        if(this.wen_qiang_count>0 && (this.an_ke_array.length + this.ming_ke_array.length)>0 && this.sun_zi_array.length==this.wen_qiang_count){
            this.hu_type = HuType.PIAO_HU;
        }
        //清胡
        else if(this.sun_zi_array.length==7){
            this.hu_type = HuType.QING_HU;
        }
        //塔子湖
        else {
            this.hu_type=HuType.TAZI_HU;
        }
        if(this.wen_qiang_count>0){
            switch(this.wen_qiang_count){
                case 1:
                this.wen_qiang_score=20;
                break;
                case 2:
                this.wen_qiang_score=50;
                break;
                case 3:
                this.wen_qiang_score=100;
                break;
                case 4:
                this.wen_qiang_score=200;
                break;
            }
        }
        if(this.hu_pai_type > 0){
            this.hu_type_score = 10;
        }

    }

}
class Pai{
    public value:number=0;
    public type:PaiType=PaiType.PAI_NONE;
    public num:number=0;
    public Print(){
        Debug.Log(this.ToString());
    }
    public ToString():string{
        return "{"+PaiType[this.type]+" "+this.value+"}";
    }
    private static pai_number_arr:Array<Pai>=new Array(150);
    public static GetPaiByNumber(num:number){
        var pai=Pai.pai_number_arr[num];
        if(!pai){
            pai = Pai.CreatePai(num);
            pai.num=num;
            Pai.pai_number_arr[num]=pai;
        }
        return pai;
    }
    public static DetailToNumberArray(details:Array<PaiDetail>):Array<number>{
        var ret:Array<number> = [];
        for(var i=0;i<details.length;i++){
            ret.push(details[i].pai.num);
        }
        return ret;
    }
    public static PrintDetailArray(details:Array<PaiDetail>){
        var msg="";
        for(var i=0;i<details.length;i++){
            msg += details[i].pai.ToString();
        }
        Debug.Log(msg);
    }
    public static Equal(n1:number,n2:number){
        if(n1 == n2)return true;
        var pai1=Pai.GetPaiByNumber(n1);
        var pai2=Pai.GetPaiByNumber(n2);
        return (pai1.value == pai2.value && pai1.type == pai2.type);
    }
    //是不是老将
    public static IsLaoJiang(ret:Pai):boolean{
        if(ret.type == PaiType.PAI_HONG|| ret.type == PaiType.PAI_QIAN||ret.type == PaiType.PAI_BAI || (ret.type == PaiType.PAI_WANG&&ret.value==9))
        {
            return true;
        }
        return false;
    }
    public static CreatePai(value:number):Pai{
        var ret=new Pai();
        
        ret.type=PaiType.PAI_NONE;
        if(value<41){
            ret.value=value%10;
            ret.type= (ret.value == 0)?PaiType.PAI_HONG:PaiType.PAI_WANG;
            return ret;
        }
        else if(value<81){
            ret.value=value%10;
            ret.type= (ret.value == 0)?PaiType.PAI_BAI:PaiType.PAI_TIAO;
            return ret;
        }
        else if(value<121){
            ret.value=value%10;
            ret.type= (ret.value == 0)?PaiType.PAI_QIAN:PaiType.PAI_TONG;
            return ret;
        }
        else
        {
            ret.value=value%125;
            ret.type= PaiType.PAI_XI;
            return ret;
        }
    }
}
class PaiDetail{
    public pai:Pai=null;
    public is_jiang:boolean=false;
    public is_laojiang:boolean=false;
}

enum JiangType{
    NONE=0,
    NORMAL,//普通将,不同
    NORMAL_SAME,//普通,相同,或者序号相同
    HIGH_SAME,//老将,只要两张都是老将即可
    HIGH_NORMAL,//半边将
}



class PaiDui{
    private pais:RandomInt;
    public jiang_pai:Array<number>=[];
    public jiang_pai_type:JiangType=JiangType.NONE;
    private pai_detail_array:Array<PaiDetail>=[];
    constructor(include_xipai:boolean){
        var pai_len=include_xipai?125:120;
        this.pais=new RandomInt(1,pai_len+1,false);
        this.jiang_pai.push(this.pais.Get());
        this.jiang_pai.push(this.pais.Get());
        this.CaculateJiangPaiType();
    }
    public GetPaiDetail(num:number):PaiDetail{
        var ret = this.pai_detail_array[num];
        if(!ret)
        {
            ret = new PaiDetail();
            ret.pai=Pai.GetPaiByNumber(num);
            ret.is_jiang=this.IsJiangPai(num);
            ret.is_laojiang=Pai.IsLaoJiang(ret.pai);
            this.pai_detail_array[num]=ret;
        }
        return ret;
    }
    private CaculateJiangPaiType(){
        var ret1 = Pai.GetPaiByNumber(this.jiang_pai[0]);
        var ret2 = Pai.GetPaiByNumber(this.jiang_pai[1]);
        var lao_jiang=[Pai.IsLaoJiang(ret1),Pai.IsLaoJiang(ret2)];
        var number_equal = ret1.value == ret2.value;
        var equal = number_equal && ret1.type == ret2.type;
        if(lao_jiang[0]&&lao_jiang[1])
        {
            this.jiang_pai_type=JiangType.HIGH_SAME;
        }
        else if(lao_jiang[0]||lao_jiang[1]){
            this.jiang_pai_type=JiangType.HIGH_NORMAL;
        }
        else if(equal||number_equal){
            this.jiang_pai_type=JiangType.NORMAL_SAME;
        }
        else{
            this.jiang_pai_type=JiangType.NORMAL;
        }

    }
    public PopValue(num:number){
        return this.pais.PopValue(num);
    }
    public Get():number{
        try {
            return this.pais.Get();
        } catch (error) {
            return 0;
        }
    }
    
    //是不是将牌
    public IsJiangPai(pai:number):boolean{
        var ret = false;
        for(var i=0;i<2;i++){
            if(Pai.Equal(this.jiang_pai[i],pai)){
                ret = true;
                break;
            }
        }
        return ret;
    }
    
    
    public GetSize():number{
        return  this.pais.GetRecoderSize();
    }

    public static GetHuPaiRate(jiang_pai_type:JiangType,pai_detail:PaiDetail,type:HuPaiRateType):number{
        var ret=1;
        switch(jiang_pai_type){
            case JiangType.HIGH_SAME:
            {
                ret = 8;
                break;
            }
            case JiangType.HIGH_NORMAL:
            {
                if(pai_detail.is_laojiang)ret =4;
                else ret = 2;
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
        if(pai_detail.is_jiang){
            if(type == HuPaiRateType.MING_KE){
                ret *= 2;
            }
            else if(type == HuPaiRateType.AN_KE){
                ret *= 3;
            }
        }
        return ret;
    }
    public static SortPaiArray(a:number,b:number):number{
        var p1 = Pai.GetPaiByNumber(a);
        var p2 = Pai.GetPaiByNumber(b);
        if(p1.type==p2.type)
        {
            if(p1.value==p2.value)
            {
                return p1.num-p2.num;
            }
            else
                return p1.value-p2.value;
        }
        else
            return p1.type-p2.type;
    }
    public CaculateDiHu(shou_pai:Array<number>,di_pai:Array<number>,an_gang:Array<number>,sort:boolean):HuPaiInfo{
        if(sort){
            shou_pai.sort(PaiDui.SortPaiArray);
            di_pai.sort(PaiDui.SortPaiArray);
        }
        
        var ming_ke_array:Array<PaiDetail>=[];
        var an_ke_array:Array<PaiDetail>=[];
        var ming_gang_array:Array<PaiDetail>=[];
        var an_gang_array:Array<PaiDetail>=[];
        var xi_pai_array:Array<PaiDetail>=[];
        var sun_zi_array:Array<PaiDetail>=[];
        var dui_zi_array:Array<PaiDetail>=[];
        var temp_array:Array<PaiDetail>=[];
        //手牌
        for(var i=0;i<shou_pai.length;i++){
            var detail=this.GetPaiDetail(shou_pai[i]);
            if(detail.pai.type == PaiType.PAI_XI){
                xi_pai_array.push(detail);
                continue;
            }
            temp_array.push(detail);
            if(temp_array.length>1 && i<shou_pai.length-1){
                //暗刻
                if(temp_array[0].pai.value == temp_array[1].pai.value){
                    var detail2 = this.GetPaiDetail(shou_pai[i+1]);
                    if(temp_array[0].pai.value == detail2.pai.value){
                        //暗刻
                        an_ke_array.push(temp_array[0]);
                        temp_array=[];
                        i++;
                        continue;
                    }
                    //对子
                    else{
                        dui_zi_array.push(temp_array[0]);
                        temp_array=[];
                        continue;
                    }
                }
                //顺子
                else if((temp_array[0].pai.value+1) == temp_array[1].pai.value &&temp_array[0].pai.type == temp_array[1].pai.type){
                    var detail2 = this.GetPaiDetail(shou_pai[i+1]);
                    if((temp_array[0].pai.value == detail2.pai.value-2) && detail2.pai.type == temp_array[0].pai.type){
                        sun_zi_array.push(temp_array[0]);
                        temp_array=[];
                        i++;
                        continue;
                    }
                }
                else{
                    temp_array=[];
                    continue;
                }
            }
            //对子
            else if(temp_array.length>1&&Pai.Equal(temp_array[0].pai.num,temp_array[1].pai.num)){
                dui_zi_array.push(temp_array[0]);
                temp_array=[];
                continue;
            }
        }
        //底牌,明刻,明杠,暗杠
        temp_array=[];
        for(var i=0;di_pai != null && i<di_pai.length;i++){
            var detail=this.GetPaiDetail(shou_pai[i]);
            if(detail.pai.type == PaiType.PAI_XI){
                xi_pai_array.push(detail);
                continue;
            }
            temp_array.push(detail);
            if(temp_array.length>2 && i<shou_pai.length-1){
                if(temp_array[0].pai.value == temp_array[1].pai.value && temp_array[0].pai.value == temp_array[2].pai.value){
                    var detail2 = this.GetPaiDetail(shou_pai[i+1]);
                    //杠
                    if(temp_array[0].pai.value == detail2.pai.value){
                        //按杠
                        if(an_gang.indexOf(detail2.pai.value)){
                            an_gang_array.push(temp_array[0])
                        }
                        //明杠
                        else{
                            ming_gang_array.push(temp_array[0]);
                        }
                        temp_array=[];
                        i++;
                        continue;
                    }
                    //明刻
                    else
                    {
                        ming_ke_array.push(temp_array[0]);
                        temp_array=[];
                    }
                }
                else{
                    temp_array=[];
                    continue;
                }
            }
        }
        var di_hu=0;
        var ming_ke_hu=0;
        var an_ke_hu = 0;
        var ming_gang_hu =0;
        var an_gang_hu =0;

        var ming_ke_base=2;
        var an_ke_base=4;
        var ming_gang_base=8;
        var an_gang_base=12;

        //明刻
        for(var i=0;i<ming_ke_array.length;i++){
            var detail = ming_ke_array[i];
            var rate = PaiDui.GetHuPaiRate(this.jiang_pai_type,detail,HuPaiRateType.MING_KE);
            ming_ke_hu += ming_ke_base*rate;
        }
        //暗刻
        for(var i=0;i<an_ke_array.length;i++){
            var detail = an_ke_array[i];
            var rate = PaiDui.GetHuPaiRate(this.jiang_pai_type,detail,HuPaiRateType.AN_KE);
            an_ke_hu += an_ke_base*rate;
        }
        //明杠
        for(var i=0;i<ming_gang_array.length;i++){
            var detail = ming_gang_array[i];
            var rate = PaiDui.GetHuPaiRate(this.jiang_pai_type,detail,HuPaiRateType.MING_GANG);
            ming_gang_hu += ming_gang_base*rate;
        }
        //按杠
        for(var i=0;i<an_gang_array.length;i++){
            var detail = an_gang_array[i];
            var rate = PaiDui.GetHuPaiRate(this.jiang_pai_type,detail,HuPaiRateType.AN_GANG);
            an_gang_hu += an_gang_base*rate;
        }
        //Debug.Log("ming ke:"+ming_ke_hu+" an ke:"+an_ke_hu+" ming gang:"+ming_gang_hu+" an gang:"+an_gang_hu);
        var di_hu = ming_ke_hu+an_ke_hu+ming_gang_hu+an_gang_hu;
        var ret_info = new HuPaiInfo();
        ret_info.ming_ke_array=ming_ke_array;
        ret_info.an_ke_array=an_ke_array;
        ret_info.ming_gang_array=ming_gang_array;
        ret_info.an_gang_array=an_gang_array;
        ret_info.sun_zi_array=sun_zi_array;
        ret_info.dui_zi_array=dui_zi_array;
        ret_info.di_hu_score=di_hu;
        return ret_info;
    }
}

class PaiNode{
    public type:PaiType=PaiType.PAI_NONE;
    public value:number=0;
    public check:number=1<<0;
    public brother:Array<PaiNode>=new Array(3);
    public parent:PaiNode=null;
    public detail:PaiDetail=null;
    constructor(detail:PaiDetail){
        this.detail=detail;
        this.type=detail.pai.type;
        this.value=detail.pai.value;
    }
    public Reset(){
        this.check=1<<0;
        this.parent=null;
        this.brother=new Array(3);
    }
    public ToString():string{
        return "{" + PaiType[this.type] + "," + this.value+"}";
    }
}

class CheckPaiNode{
    public pai_list:Array<PaiNode>=[];
    public is_win=false;
    public last_node:PaiNode=null;
    public win_node:Array<Array<PaiDetail>>=[];
    public Reset(){
        this.is_win=false;
        this.win_node=[];
        for(var i=0;i<this.pai_list.length;i++){
            this.pai_list[i].Reset();
        }
    }
    public AddPai(pai:PaiNode){
        this.pai_list.push(pai);
    }
    public SetPais(pais:Array<PaiNode>){
        this.pai_list=pais;
    }
    public AddOriginPai(pai:PaiDetail){
        this.pai_list.push(new PaiNode(pai));
    }
    private Sort(p1:PaiNode,p2:PaiNode){
        if(p1.type==p2.type)
        {
            if(p1.value==p2.value)
            {
                return p1.detail.pai.num-p2.detail.pai.num;
            }
            else
                return p1.value-p2.value;
        }
        else
            return p1.type-p2.type;
    }
    public CheckWin(){
        this.pai_list.sort(this.Sort);
        var type = 0;
        var num = 0;
        for(var i =0;i<this.pai_list.length;i++)
        {
            var p = this.pai_list[i];
            if(p.type!=type||p.value!=num)
            {
                type = p.type;
                num = p.value;
                for(var j=i+1;j<i+4;j++)
                {
                    if(j>this.pai_list.length-1)
                    break;
                    var p2 = this.pai_list[j];
                    if(p2.type == p.type&&p2.value==p.value)
                    {
                        this.Reset();
                        p.brother[0] = p2;
                        p.check = 1<<4;
                        p2.check = 1<<4;
                        for(var k=0;k<this.pai_list.length;k++)
                        {
                            if(this.pai_list[k].check == 1<<0)
                            {
                                this.Check(this.pai_list[k]);
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        }
        if(this.win_node.length>0){
            return this.win_node;
        }
        return null;
    }
    public Check(p:PaiNode){
        this.ClearBrother(p);
        switch(p.check)
        {
            case 1<<0:
                this.Check1(p);
                break;
            case 1<<1:
                this.Check2(p);
                break;
            case 1<<2:
                this.Check3(p);
                break;
            default:
                this.CheckLast(p);
                break;   
        }
    }
    public ClearBrother(p:PaiNode)
    {
        for (var i = 0; i < p.brother.length; i++)
        {
            if (p.brother[i] != null)
            {
                p.brother[i].check = 1 << 0;
            }
            p.brother[i] = null;
        }
    }
    public Check1(p) {
        p.check = 1 << 1;
        this.CheckBrother(p, 1);
        if (p.brother[0] != null && p.brother[1] != null)
        {
            this.CheckNext(p);
        }
        else
        {
            this.Check(p);
        }
    }
    
    public Check2(p) {
        p.check = 1 << 2;
        this.CheckBrother(p, 2);
        if (p.brother[0] != null && p.brother[1] != null)
        {
            this.CheckNext(p);
        }
        else
        {
            this.Check(p);
        }
    }
    
    public Check3(p)
    {
        p.check = 1 << 3;
        this.CheckBrother(p, 3);
        if (p.brother[0] != null && p.brother[1] != null && p.brother[2] != null)
        {
            this.CheckNext(p);
        }
        else
        {
            this.Check(p);
        }
    }
    public CheckNext(p:PaiNode)
    {
        for (var i = 0; i < this.pai_list.length; i++)
        {
            if (this.pai_list[i].check == 1<<0)
            {
                this.pai_list[i].parent = p;
                this.last_node = this.pai_list[i];
                this.Check(this.last_node);
                return;
            }
        }
        this.GetResult(true);
        this.last_node.check = this.last_node.check << 1;
        this.Check(this.last_node);
    }
    public CheckBrother(p:PaiNode,index:number)
    {
        switch (index)
        {
            case 1: 
                {
                    for (var i = 0; i < this.pai_list.length; i++)
                    {
                        if (this.pai_list[i].check != (1 << 0))
                            continue;
                        if (this.pai_list[i].type == p.type && this.pai_list[i].value == p.value + 1)
                        {
                            p.brother[0] = this.pai_list[i];
                            p.brother[0].check = 1 << 4;
                            for (var j = i+1; j < i+4; j++)
                            {
                                if (j >= this.pai_list.length)
                                    break;
                                if (this.pai_list[j].check != (1 << 0))
                                    continue;
                                if (this.pai_list[j].type == p.type && this.pai_list[j].value == p.value + 2)
                                {
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
                    for (var i = 0; i < this.pai_list.length; i++)
                    {
                        if (this.pai_list[i].check != (1 << 0))
                            continue;
                        if (i > this.pai_list.length - 2)
                            break;
                        if (this.pai_list[i].type == p.type && this.pai_list[i].value == p.value)
                        {
                            if (this.pai_list[i + 1].type == p.type && this.pai_list[i + 1].value == p.value)
                            {
                                p.brother[0] = this.pai_list[i];
                                p.brother[0].check = 1 << 4;
                                p.brother[1] = this.pai_list[i+1];
                                p.brother[1].check = 1 << 4;
                                break;
                            }
                        }
                    }
                }
                break;
            case 3:
                {
                    for (var i = 0; i < this.pai_list.length; i++)
                    {
                        if (this.pai_list[i].check != (1 << 0))
                            continue;
                        if (i > this.pai_list.length - 3)
                            break;
                        if (this.pai_list[i].type == p.type && this.pai_list[i].value == p.value)
                        {
                            if (this.pai_list[i + 1].type == p.type && this.pai_list[i + 1].value == p.value)
                            {
                                if (this.pai_list[i + 2].type == p.type && this.pai_list[i + 2].value == p.value)
                                { 
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
    }
    public CheckLast(p)
    {
        this.ClearBrother(p);
        if (p.parent != null)
        {
            p.check = 1 << 0;
            this.last_node = p.parent;
            this.Check(this.last_node);
        }
        else
        {
            this.GetResult(false);
        }
    }
    private static SortArray(a:Array<any>,b:Array<any>){
        return b.length-a.length;
    }
    public GetResult(tag) {
        this.is_win = tag;
        if (this.is_win)
        {
            var win_info:Array<Array<PaiDetail>>=[];
            for (var i = 0; i < this.pai_list.length; i++)
            {
                var p = this.pai_list[i];
                
                if (p.brother[0] != null)
                {
                    var temp:Array<PaiDetail>=[];
                    temp.push(p.detail);
                    //var text = p.ToString();
                    for (var j = 0; j < p.brother.length; j++)
                    {
                        if (p.brother[j] != null)
                            {
                                temp.push(p.brother[j].detail);
                                //text += p.brother[j].ToString();

                            }
                    }
                    //Debug.Log(text);
                    win_info.push(temp);
                }
                
            }
            win_info.sort(CheckPaiNode.SortArray);
            var win_info2:Array<PaiDetail>=[];
            for(var i=0;i<win_info.length;i++){
                for(var j=0;j<win_info[i].length;j++){
                    win_info2.push(win_info[i][j]);
                }
            }
            win_info=null;
            this.win_node.push(win_info2);
        }
    }

}