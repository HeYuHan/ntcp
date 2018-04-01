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
    AN_GANG,
    JIAO_PAI
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
    public jiao_pai_array:Array<PaiDetail>=[];
    public hu_pai_array:Array<number>=[];
    public di_hu_score:number=0;
    public totle_socre:number=0;
    public wen_qiang_score:number=0;
    public xi_pai_score:number=0;
    public san_long_ju_hu_score:number=0;
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
        Debug.Log("------------jiao pai---------------");
        Pai.PrintDetailArray(this.jiao_pai_array);
        Debug.Log("------------xi---------------");
        Pai.PrintDetailArray(this.xi_array);
        Debug.Log("HuType:"+HuType[this.hu_type]);
        Debug.Log("HuPaiType:"+this.hu_pai_type);
        Debug.Log("dihu:"+this.di_hu_score);
        Debug.Log("xi:"+this.xi_pai_score);
        Debug.Log("wenqiang:"+this.wen_qiang_score);
        Debug.Log("totle:"+this.totle_socre);
        Debug.Log("-------------end--------------\n\n");
    }
    public static SortInfo(a:HuPaiInfo,b:HuPaiInfo){
        return a.totle_socre-b.totle_socre;
    }
    public CaculateTotleScore(hu_pai:PaiDetail){
        //喜牌分数
        var qiong_xi=false;
        switch(this.xi_array.length){
            case 0:
            qiong_xi=true;
            this.xi_pai_score=0;
            break;
            case 1:
            this.xi_pai_score=10;
            case 2:
            this.xi_pai_score=30;
            break;
            case 3:
            this.xi_pai_score=50;
            break;
            case 4:
            this.xi_pai_score=100;
            break;
            case 5:
            this.xi_pai_score=200;
            break;
        }
        if(!hu_pai){
            this.totle_socre=this.di_hu_score + this.san_long_ju_hu_score + this.xi_pai_score;
            this.totle_socre=Math.ceil(this.totle_socre/10)*10;
            return;
        }
        if(hu_pai)
        {
            var wen_qiang_count=0;
            var temp_hu_pai_type=HuPaiType.NONE;
            if(hu_pai.pai.value == 1||hu_pai.pai.value == 9){
                temp_hu_pai_type |= HuPaiType.BIAN_ZHANG;
                Debug.Log("bian zhang..........");
            }
            else
            {
                //单吊
                for(var i=0;i<this.dui_zi_array.length;i++){
                    var d=this.dui_zi_array[i];
                    if(d.pai.value == hu_pai.pai.value && d.pai.type == hu_pai.pai.type){
                        temp_hu_pai_type |= HuPaiType.DANG_DIAO;
                        Debug.Log("dang diao......");
                    }
                }
            }
            for(var i=0;i<this.sun_zi_array.length;i++){
                var d = this.sun_zi_array[i];
                if(d.pai.value==1 && d.pai.type == PaiType.PAI_TONG){
                    wen_qiang_count++;
                }
                //丫子
                if(temp_hu_pai_type == 0&&(d.pai.value == hu_pai.pai.value - 1) && d.pai.type == hu_pai.pai.type){
    
                    this.hu_pai_type |= HuPaiType.YA_ZI;
                    Debug.Log("ya zi..........");
                    
                }
            }
            this.hu_pai_type |=temp_hu_pai_type;
            
            if(wen_qiang_count>0)
            {
                this.hu_pai_type |=HuPaiType.WEN_QIAN;
                switch(wen_qiang_count){
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
            this.totle_socre=this.di_hu_score + this.san_long_ju_hu_score + this.wen_qiang_score + this.xi_pai_score;
            if(this.hu_pai_type & HuPaiType.DANG_DIAO)
            {
                this.totle_socre += 10;
            }
            if(this.hu_pai_type & HuPaiType.YA_ZI)
            {
                this.totle_socre += 10;
            }
            if(this.hu_pai_type & HuPaiType.BIAN_ZHANG)
            {
                this.totle_socre += 10;
            }
            if(this.hu_pai_type & HuPaiType.ZI_MO)
            {
                this.totle_socre += 10;
            }
            //天胡
            var  socre_rate=1;
            if(this.hu_pai_type & HuPaiType.TIANG_HU){
                socre_rate = 4;
            }
            else if(this.hu_pai_type & HuPaiType.TIANG_TING){
                socre_rate = 2;
            }
            else if(this.hu_pai_type & HuPaiType.QIONG_XI){
                Debug.Log("qiong xi......."+this.totle_socre);
                socre_rate = 2;
            }
            //没有顺子
            if(this.sun_zi_array.length==0){
                this.hu_type = HuType.PIAO_HU;
                this.totle_socre +=50;
                socre_rate *=2;
            }
            //清胡,7个顺子
            else if(this.sun_zi_array.length==7){
                this.hu_type = HuType.QING_HU;
                this.totle_socre +=100;
            }
            //塔子湖
            else {
                Debug.Log("tai zi hu......."+this.totle_socre);
                this.hu_type=HuType.TAZI_HU;
                this.totle_socre +=20;
            }
            if(qiong_xi){
                socre_rate*=2;
                this.hu_pai_type |=HuPaiType.QIONG_XI;
            }
            this.totle_socre=Math.ceil(this.totle_socre/10)*10*socre_rate;
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
    public static SortNumber(a:number,b:number):number{
        var p1=Pai.GetPaiByNumber(a);
        var p2=Pai.GetPaiByNumber(b);
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
    public static DetailToNumberArray(details:Array<PaiDetail>):Array<number>{
        var ret:Array<number> = [];
        for(var i=0;i<details.length;i++){
            ret.push(details[i].pai.num);
        }
        return ret;
    }
    public static PrintNumberArray(nums:Array<number>){
        var msg="";
        for(var i=0;i<nums.length;i++){
            msg += Pai.GetPaiByNumber(nums[i]).ToString();
        }
        Debug.Log(msg);
    }
    public static PrintDetailArray(details:Array<PaiDetail>){
        var msg="";
        for(var i=0;i<details.length;i++){
            msg += details[i].pai.ToString();
        }
        Debug.Log(msg);
    }
    public static PrintArray(pais:Array<Pai>){
        var msg="";
        for(var i=0;i<pais.length;i++){
            msg += pais[i].ToString();
        }
        Debug.Log(msg);
    }
    public static Equal(n1:number,n2:number){
        if(n1 == n2)return true;
        var pai1=Pai.GetPaiByNumber(n1);
        var pai2=Pai.GetPaiByNumber(n2);
        return (pai1.value == pai2.value && pai1.type == pai2.type);
    }
    public static Equal2(pai1:Pai,pai2:Pai){
        return (pai1.value == pai2.value && pai1.type == pai2.type);
    }
    //是不是老将
    public static IsLaoJiang(ret:Pai):boolean{
        if(ret.type == PaiType.PAI_HONG|| ret.type == PaiType.PAI_QIAN||ret.type == PaiType.PAI_BAI || (ret.type == PaiType.PAI_TIAO&&ret.value==9))
        {
            return true;
        }
        return false;
    }
    public static ValueToNumber(type:PaiType,value:number):number{
        var ret=0;
        if(type==PaiType.PAI_HONG)return 10;
        if(type==PaiType.PAI_WANG)return value;
        if(type==PaiType.PAI_BAI) return 50;
        if(type==PaiType.PAI_TIAO)return value+40;
        if(type==PaiType.PAI_QIAN)return 90;
        if(type==PaiType.PAI_TONG)return value+80;
        if(type==PaiType.PAI_XI)  return 121;
        return ret;
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
            ret.value=value%120;
            ret.type= PaiType.PAI_XI;
            return ret;
        }
    }
}
class PaiDetail{
    public pai:Pai=null;
    public is_jiang:boolean=false;
    public is_laojiang:boolean=false;
    public equal_jiang_value:boolean =false;
    public static Equal(p1:PaiDetail,p2:PaiDetail)
    {
        return Pai.Equal2(p1.pai,p2.pai);
    }
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
    private includ_xipai=false;
    constructor(include_xipai:boolean){
        this.jiang_pai[0]=Math.floor(Math.random()*120)+1;
        this.jiang_pai[1]=Math.floor(Math.random()*120)+1;
        this.pais=new RandomInt(1,include_xipai?126:121,false);
        this.pais.PopValue(this.jiang_pai[0]);
        this.pais.PopValue(this.jiang_pai[1]);
        this.includ_xipai=include_xipai;
        this.CaculateJiangPaiType();
    }
    public GetMaxSize(){
        return this.includ_xipai?125:120;
    }
    public GetPaiDetail(num:number):PaiDetail{
        var ret = this.pai_detail_array[num];
        if(!ret)
        {
            ret = new PaiDetail();
            ret.pai=Pai.GetPaiByNumber(num);
            ret.is_jiang=this.IsJiangPai(num);
            ret.is_laojiang=Pai.IsLaoJiang(ret.pai);
            var j1=Pai.GetPaiByNumber(this.jiang_pai[0]);
            var j2=Pai.GetPaiByNumber(this.jiang_pai[1]);
            ret.equal_jiang_value=(j1.value==ret.pai.value || j2.value == ret.pai.value);
            this.pai_detail_array[num]=ret;
        }
        return ret;
    }
    public CaculateJiangPaiType(){
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
        return this.pais.Get();
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
        var hu=2;
        var rate=1;
        if(pai_detail.is_jiang){
            switch(jiang_pai_type){
                case JiangType.HIGH_SAME:
                {
                    rate = 16;
                    break;
                }
                case JiangType.HIGH_NORMAL:
                {
                    if(pai_detail.is_laojiang)rate =8;
                    else rate = 4;
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
        else if(pai_detail.is_laojiang){
            switch(jiang_pai_type){
                case JiangType.HIGH_SAME:
                {
                    rate = 8;
                    break;
                }
                case JiangType.HIGH_NORMAL:
                {
                    if(pai_detail.is_laojiang)rate =4;
                    else rate = 1;
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
        else if(pai_detail.equal_jiang_value)
        {
            rate=2;
        }
        hu = hu *rate;
        if(pai_detail.is_jiang){
            if(type == HuPaiRateType.AN_KE){
                hu *=3;
            }
            else if(type == HuPaiRateType.JIAO_PAI){
                hu *=4;
            }
        }
        else{
            if(type == HuPaiRateType.AN_KE){
                hu *=2;
            }
            else if(type == HuPaiRateType.MING_GANG){
                hu *=4;
            }
            else if(type == HuPaiRateType.AN_GANG){
                hu *=6;
            }
            else if(type == HuPaiRateType.JIAO_PAI){
                hu *=8;
            }
        }
        return hu;
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
    public CaculateDiHu(shou_pai:Array<number>,di_pai:Array<number>,an_gang:Array<Pai>,jiao_pai:Array<number>):HuPaiInfo{

        var ming_ke_array:Array<PaiDetail>=[];
        var an_ke_array:Array<PaiDetail>=[];
        var ming_gang_array:Array<PaiDetail>=[];
        var an_gang_array:Array<PaiDetail>=[];
        var xi_pai_array:Array<PaiDetail>=[];
        var sun_zi_array:Array<PaiDetail>=[];
        var dui_zi_array:Array<PaiDetail>=[];
        var jiao_pai_array:Array<PaiDetail>=[];
        var temp_array:Array<PaiDetail>=[];

        //判断三花聚会
        var san_hua=0;
        var have_san_hua=false;
        //手牌
        for(var i=0;i<shou_pai.length;i++){
            
            var detail=this.GetPaiDetail(shou_pai[i]);
            if(detail.pai.type == PaiType.PAI_XI){
                xi_pai_array.push(detail);
                continue;
            }
            if(detail.is_laojiang)
            {
                if(detail.pai.type==PaiType.PAI_HONG)san_hua |=1<<1;
                else if(detail.pai.type==PaiType.PAI_BAI) san_hua |=1<<2;
                else if(detail.pai.type==PaiType.PAI_QIAN) san_hua |=1<<3;
            }
            temp_array.push(detail);
            //类型不同跳过第一张
            if(temp_array.length>1 && temp_array[0].pai.type != temp_array[1].pai.type)
            {
                temp_array.splice(0,1);
                continue;
            }
            if(temp_array.length<2)continue;
            if(true)
            {

                if(temp_array.length<3)continue;
                if(temp_array[2].pai.type != temp_array[0].pai.type)
                {
                    temp_array=[temp_array[1],temp_array[2]];
                    continue;
                }
                //暗刻
                if(temp_array[0].pai.value == temp_array[1].pai.value && temp_array[0].pai.value == temp_array[2].pai.value)
                {
                    if(jiao_pai.indexOf(temp_array[0].pai.num)<0)an_ke_array.push(temp_array[0]);
                    temp_array=[];
                    continue;
                }
                // //对子(前面两个)
                // else if(temp_array[0].pai.value == temp_array[1].pai.value)
                // {
                //     dui_zi_array.push(temp_array[0]);
                //     temp_array=[temp_array[2]];
                //     continue;
                // }
                // //对子(后两个)
                // else if(temp_array[1].pai.value == temp_array[2].pai.value)
                // {
                //     dui_zi_array.push(temp_array[1]);
                //     temp_array=[temp_array[1],temp_array[2]];
                //     continue;
                // }
                else
                {
                    temp_array=[temp_array[1],temp_array[2]];
                    continue;
                }
            }
            
        }
        
        temp_array=[];
        for(var i=0;i<shou_pai.length;i++)
        {
            var detail=this.GetPaiDetail(shou_pai[i]);
            if(detail.pai.type == PaiType.PAI_XI){
                continue;
            }
            temp_array.push(detail);
            //类型不同跳过第一张
            if(temp_array.length>1 && temp_array[0].pai.type != temp_array[1].pai.type)
            {
                temp_array=[temp_array[1]];
                continue;
            }
            if(temp_array.length<2)continue;
            if(temp_array[0].pai.value == temp_array[1].pai.value)
            {
                //取出下一张
                if(i<shou_pai.length-1)
                {
                    var detail2 = this.GetPaiDetail(shou_pai[i+1]);
                    if(PaiDetail.Equal(temp_array[0],detail2)){
                        //暗刻,剔除叫牌
                        //if(jiao_pai.indexOf(temp_array[0].pai.num)<0)an_ke_array.push(temp_array[0]);
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
                //对子
                else{
                    dui_zi_array.push(temp_array[0]);
                    temp_array=[];
                    continue;
                }
            }
            else
            {
                //取出下一张
                if(i<shou_pai.length-1)
                {
                    var detail2 = this.GetPaiDetail(shou_pai[i+1]);
                    //顺子
                    if((temp_array[0].pai.value == detail2.pai.value-2) && detail2.pai.type == temp_array[0].pai.type){
                        sun_zi_array.push(temp_array[0]);
                        temp_array=[];
                        i++;
                        continue;
                    }
                    else{
                        temp_array=[temp_array[1]];
                        continue;
                    }
                }
                else{
                    temp_array=[temp_array[1]];
                    continue;
                }
            }
        }
        //底牌,明刻,明杠,暗杠
        temp_array=[];
        for(var i=0;di_pai != null && i<di_pai.length;i++){
            var detail=this.GetPaiDetail(di_pai[i]);
            if(detail.pai.type == PaiType.PAI_XI){
                xi_pai_array.push(detail);
                continue;
            }
            if(detail.is_laojiang)
            {
                if(detail.pai.type==PaiType.PAI_HONG)san_hua |=1<<1;
                else if(detail.pai.type==PaiType.PAI_BAI) san_hua |=1<<2;
                else if(detail.pai.type==PaiType.PAI_QIAN) san_hua |=1<<3;
            }
            temp_array.push(detail);
            //类型不同跳过第一张
            if(temp_array.length>1 && temp_array[0].pai.type != temp_array[1].pai.type)
            {
                temp_array=[temp_array[1]];
                continue;
            }
            //类型不同跳过第二张
            if(temp_array.length>2 && temp_array[0].pai.type != temp_array[2].pai.type)
            {
                temp_array=[temp_array[2]];
                continue;
            }
            if(temp_array.length<3)continue;
            if(temp_array[0].pai.value == temp_array[1].pai.value && temp_array[0].pai.value == temp_array[2].pai.value)
            {
                if(i<di_pai.length-1)
                {
                    var detail2 = this.GetPaiDetail(di_pai[i+1]);
                    if(temp_array[0].pai.value == detail2.pai.value){
                        var is_an_gang=false;
                        for(var m=0;m<an_gang.length;m++)
                        {
                            if(Pai.Equal2(an_gang[m],temp_array[0].pai))
                            {
                                an_gang_array.push(temp_array[0]);
                                is_an_gang=true;
                                break;
                            }
                        }
                        if(!is_an_gang)ming_gang_array.push(temp_array[0]);
                        temp_array=[];
                        i++;
                        continue;
                    }
                    //明刻,剔除叫牌
                    else
                    {
                        if(jiao_pai.indexOf(temp_array[0].pai.num)<0)ming_ke_array.push(temp_array[0]);
                        temp_array=[];
                    }
                }
                else
                {
                    if(jiao_pai.indexOf(temp_array[0].pai.num)<0)ming_ke_array.push(temp_array[0]);
                    temp_array=[];
                }
            }
            else
            {
                temp_array=[];
            }
        }
        var di_hu=0;
        var ming_ke_hu=0;
        var an_ke_hu = 0;
        var ming_gang_hu =0;
        var an_gang_hu =0;
        var jiao_hu=0;

        have_san_hua = ((san_hua&(1<<1))>0)&&((san_hua&(1<<2))>0)&&((san_hua&(1<<3))>0);
        //将手牌上含有明刻的放到明杠
        for(var i=0;i<sun_zi_array.length;i++){
            var detail = sun_zi_array[i];
            for(var k=0;k<3;k++){
                var detail2 = this.GetPaiDetail(detail.pai.num+k);
                var index=ming_ke_array.indexOf(detail2);
                if(index>=0){
                    ming_ke_array.splice(index,1);
                    ming_gang_array.push(detail2);
                }
            }
        }
        //明刻
        for(var i=0;i<ming_ke_array.length;i++){
            var detail = ming_ke_array[i];
            var hu = PaiDui.GetHuPaiRate(this.jiang_pai_type,detail,HuPaiRateType.MING_KE);
            ming_ke_hu += hu;
            if(detail.is_laojiang && detail.pai.type !=PaiType.PAI_TIAO && have_san_hua)ming_ke_hu+=hu;
        }
        //暗刻
        for(var i=0;i<an_ke_array.length;i++){
            var detail = an_ke_array[i];
            var hu= PaiDui.GetHuPaiRate(this.jiang_pai_type,detail,HuPaiRateType.AN_KE);
            an_ke_hu += hu;
            if(detail.is_laojiang && detail.pai.type !=PaiType.PAI_TIAO && have_san_hua)an_ke_hu+=hu;
        }
        //明杠
        for(var i=0;i<ming_gang_array.length;i++){
            var detail = ming_gang_array[i];
            var hu=PaiDui.GetHuPaiRate(this.jiang_pai_type,detail,HuPaiRateType.MING_GANG);
            ming_gang_hu += hu;
            if(detail.is_laojiang && detail.pai.type !=PaiType.PAI_TIAO && have_san_hua)ming_gang_hu+=hu;
        }
        //按杠
        for(var i=0;i<an_gang_array.length;i++){
            var detail = an_gang_array[i];
            var hu=PaiDui.GetHuPaiRate(this.jiang_pai_type,detail,HuPaiRateType.AN_GANG);
            an_gang_hu += hu;
            if(detail.is_laojiang && detail.pai.type !=PaiType.PAI_TIAO && have_san_hua)an_gang_hu+=hu;
        }
        //叫牌
        for(var i=0;i<jiao_pai.length;i++){
            
            var detail = this.GetPaiDetail(jiao_pai[i]);
            jiao_pai_array.push(detail);
            var hu=PaiDui.GetHuPaiRate(this.jiang_pai_type,detail,HuPaiRateType.JIAO_PAI);
            jiao_hu += hu;
            if(detail.is_laojiang && detail.pai.type !=PaiType.PAI_TIAO && have_san_hua)jiao_hu+=hu;
        }
        Debug.Log("ming ke:"+ming_ke_hu+" an ke:"+an_ke_hu+" ming gang:"+ming_gang_hu+" an gang:"+an_gang_hu+" jiao hu:"+jiao_hu);
        var di_hu = ming_ke_hu+an_ke_hu+ming_gang_hu+an_gang_hu+jiao_hu;
        var ret_info = new HuPaiInfo();
        ret_info.ming_ke_array=ming_ke_array;
        ret_info.an_ke_array=an_ke_array;
        ret_info.ming_gang_array=ming_gang_array;
        ret_info.an_gang_array=an_gang_array;
        ret_info.sun_zi_array=sun_zi_array;
        ret_info.dui_zi_array=dui_zi_array;
        ret_info.jiao_pai_array=jiao_pai_array;
        ret_info.di_hu_score=di_hu;
        ret_info.xi_array=xi_pai_array;
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
        if(this.pai_list.length==2)
        {
            if(PaiDetail.Equal(this.pai_list[0].detail,this.pai_list[1].detail))
            {
                return [[this.pai_list[0].detail,this.pai_list[1].detail]];
            }
            else
            {
                return [];
            }
        }
        this.win_node=[];
        this.pai_list.sort(this.Sort);
        var msg = "";
        for(var i=0;i<this.pai_list.length;i++)
        {
            msg += "["+this.pai_list[i].type+" "+this.pai_list[i].value +"],"
        }
        
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
        return this.win_node;
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
            if(win_info2.length>0)this.win_node.push(win_info2);
        }
    }

}