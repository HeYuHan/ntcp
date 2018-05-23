//人数限制
let ROOM_MAX_PLAYER_COUNT = 1;
//关闭随机
let DEFINE_RANDOM_TEST = true;

let INFO_SERVER_URL = "http://127.0.0.1:9800/private/";

let WRITE_ROOM_RECODER = true;

let AUTO_CHU_PAI_TIME = 18;

let INFO_ACCESS_TOKEN = "1234567";

function LogInfo(msg){
    Debug.Log(1,msg);
}
function LogWarn(msg){
    Debug.Log(2,msg);
}
function LogError(msg){
    Debug.Log(3,msg);
}
function PostJson(url,data,call_back){
    var http=new Http();
    http.OnResponse=call_back;
    http.Post(url,JSON.stringify(data),"application/json");
}

function PrintError(msg,e){
    LogError(msg+e.message+"\nname:"+e.name+"\nstack:"+e.stack);
}
class ScriptLoader{
    public static ROOT_PATH:string;
    private scripts={};
    public Load(path:string){
        var state=this.scripts[path]||{};
        if(!(state.ok || state.loading))
        {
            state.loading=true;
            this.scripts[path]=state;
            var ok=FileHelper.LoadScript(ScriptLoader.ROOT_PATH + path);
            state.loading=false;
            this.scripts[path].ok=ok;
        }
    }
    private static m_Instance=null;
    public static GetInstance():ScriptLoader{
        if(ScriptLoader.m_Instance == null){
            ScriptLoader.m_Instance=new ScriptLoader();
        }
        return ScriptLoader.m_Instance;
    }
}

function require(path:string){
    ScriptLoader.GetInstance().Load(path);
}

class RandomInt{
    private min:number;
    private max:number;
    private repeat:boolean;
    private recoders:Array<number>;
    constructor(min:number,max:number,repeat:boolean){
        this.min=min;
        this.max=max;
        this.repeat=repeat;
        if(!this.repeat){
            this.recoders=[];
            for(var i=min;i<max;i++){
                this.recoders.push(i);
            }
            if(!DEFINE_RANDOM_TEST)
            {
                var len=max-min;
                if(len>1)
                {
                    for(var i=len-1;i>0;--i)
                    {
                        var value=this.recoders[i];
                        var rand_index=Math.floor((Math.random()*this.max))%i;
                        this.recoders[i]=this.recoders[rand_index];
                        this.recoders[rand_index]=value;
                    }
                }
            }

        }
    }
    public Insert(newvalue:number):boolean{
        if( newvalue>= this.min && newvalue <= this.max)return false;
        if(this.recoders.indexOf(newvalue)>=0)return false;
        var index=Math.floor(Math.random()*this.recoders.length);
        var value=this.recoders[index];
        this.recoders[index]=newvalue;
        this.recoders.push(value);
    }
    public Get():number{
        if(this.repeat){
            var range=this.max-this.min;
            return Math.floor(Math.random()*range)+this.min;
        }
        else
        {
            if(this.recoders.length == 0){
                LogInfo("random recoder is empty");
                throw "random recoder is empty";
            }
            return this.recoders.pop();
        }
    }
    public PopValue(value:number):boolean{
        for(var i=0;i<this.recoders.length;i++){
            if(this.recoders[i]==value){
                this.recoders.splice(i,1);
                return true;
            }
        }
        return false;
    }
    public ReleaseValue(newvalue:number){
        if( newvalue>= this.min && newvalue <= this.max && this.recoders.indexOf(newvalue)<0)
        {
            var index=Math.floor(Math.random()*this.recoders.length);
            var value=this.recoders[index];
            this.recoders[index]=newvalue;
            this.recoders.push(value);
        }
        
    }
    public GetRecoderList():Array<number>{
        if(!this.repeat)return this.recoders.slice(0);
        return null;
    }
    public GetRecoderSize():number{
        if(!this.repeat)return this.recoders.length;
        return 0;
    }
}




ScriptLoader.ROOT_PATH=FileHelper.MainScriptPath().replace("main.js","");

require("native.js");
require("server.js");
require("client.js");
require("pai.js");
require("room.js");
require("message_type.js");

// var pai_dui=new PaiDui(true);
// pai_dui.jiang_pai[0]=Pai.ValueToNumber(PaiType.PAI_TIAO,9);
// pai_dui.jiang_pai[1]=Pai.ValueToNumber(PaiType.PAI_TONG,2);
// pai_dui.CaculateJiangPaiType();
// var shou=[];
// var index=0;
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_WANG,3);
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_WANG,3);
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_WANG,3);
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_WANG,4);
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_WANG,5);
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_WANG,6);
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_WANG,7);
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_WANG,8);

// shou[index++]=Pai.ValueToNumber(PaiType.PAI_TIAO,6);
// shou[index++]=Pai.ValueToNumber(PaiType.PAI_TIAO,6);
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_TIAO,4);
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_TIAO,7);
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_TIAO,8);
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_TIAO,9);
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_TIAO,9);
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_TIAO,9);

// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_TONG,1);
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_TONG,2);
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_TONG,3);
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_TONG,4);
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_TONG,5);
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_TONG,5);
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_TONG,6);
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_TONG,6);
// // shou[index++]=Pai.ValueToNumber(PaiType.PAI_TONG,7);

// shou[index++]=Pai.ValueToNumber(PaiType.PAI_HONG,6);
// shou[index++]=Pai.ValueToNumber(PaiType.PAI_HONG,6);
// shou[index++]=Pai.ValueToNumber(PaiType.PAI_HONG,6);

// var di=[];
// index=0;
// di[index++]=Pai.ValueToNumber(PaiType.PAI_WANG,7);
// di[index++]=Pai.ValueToNumber(PaiType.PAI_WANG,7);
// di[index++]=Pai.ValueToNumber(PaiType.PAI_WANG,7);

// di[index++]=Pai.ValueToNumber(PaiType.PAI_TIAO,3);
// di[index++]=Pai.ValueToNumber(PaiType.PAI_TIAO,3);
// di[index++]=Pai.ValueToNumber(PaiType.PAI_TIAO,3);
// di[index++]=Pai.ValueToNumber(PaiType.PAI_TIAO,7);
// di[index++]=Pai.ValueToNumber(PaiType.PAI_TIAO,7);
// di[index++]=Pai.ValueToNumber(PaiType.PAI_TIAO,7);

// di[index++]=Pai.ValueToNumber(PaiType.PAI_TONG,8);
// di[index++]=Pai.ValueToNumber(PaiType.PAI_TONG,8);
// di[index++]=Pai.ValueToNumber(PaiType.PAI_TONG,8);
// di[index++]=Pai.ValueToNumber(PaiType.PAI_TONG,8);

// di[index++]=Pai.ValueToNumber(PaiType.PAI_BAI,121);
// di[index++]=Pai.ValueToNumber(PaiType.PAI_BAI,121);
// di[index++]=Pai.ValueToNumber(PaiType.PAI_BAI,121);

// di[index++]=Pai.ValueToNumber(PaiType.PAI_QIAN,121);
// di[index++]=Pai.ValueToNumber(PaiType.PAI_QIAN,121);
// di[index++]=Pai.ValueToNumber(PaiType.PAI_QIAN,121);

// di[index++]=Pai.ValueToNumber(PaiType.PAI_XI,121);

// // var caulater= new CheckPaiNode();
// // for(var i=0;i<shou.length;i++){
// //     caulater.AddOriginPai(pai_dui.GetPaiDetail(shou[i]));
// // }
// // var result_array = caulater.CheckWin();
// // LogInfo("result array len:"+result_array.length);
// // for(var i=0;i<result_array.length;i++){
// //     Pai.PrintDetailArray(result_array[i]);
// // }
// // if(result_array.length>0)shou=Pai.DetailToNumberArray(result_array[0]);
// // var info=pai_dui.CaculateDiHu(shou,di,[],[]);
// // info.CaculateTotleScore(pai_dui.GetPaiDetail(Pai.ValueToNumber(PaiType.PAI_TIAO,6)));
// // info.Print();










// // function start(){
// //     this.pai_list=[];
// //     this.pai_list[0] = new PaiNode(1,1);
// //     this.pai_list[1] = new PaiNode(1,1);
// //     this.pai_list[2] = new PaiNode(1,1);
// //     this.pai_list[3] = new PaiNode(1,1);
// //     this.pai_list[4] = new PaiNode(1,2);
// //     this.pai_list[5] = new PaiNode(1,3);
// //     this.pai_list[6] = new PaiNode(1,3);
// //     this.pai_list[7] = new PaiNode(1,3);
// //     this.pai_list[8] = new PaiNode(1,3);
// //     this.pai_list[9] = new PaiNode(1,4);
// //     this.pai_list[10] = new PaiNode(1,4);
// //     this.pai_list[11] = new PaiNode(1,4);
// //     this.pai_list[12] = new PaiNode(2,5);
// //     this.pai_list[13] = new PaiNode(2,5);
// //     var check=new CheckPaiNode();
// //     check.SetPais(this.pai_list);
// //     check.CheckWin();
// // }
// // start();
function Main(){
    var server = new JServer();
    var ret = server.Init({
        max_client:50
    });
    LogInfo("init server ret:"+ret);
    var ret2 = server.Start();
    LogInfo("exit server ret:"+ret2);
    return 0;
}