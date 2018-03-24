//人数限制
let ROOM_MAX_PLAYER_COUNT=2;
//关闭随机
let DEFINE_RANDOM_TEST=true;

let INFO_SERVER_URL="http://127.0.0.1:9800/private/";

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
            Debug.Log("load script "+ok+" from :"+path);
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
                Debug.Log("random recoder is empty");
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




if(Server.Platfrom() == 1)ScriptLoader.ROOT_PATH="E:/Share/ntcp/server/src/script/js/";
else ScriptLoader.ROOT_PATH="./js/";




require("server.js");
require("client.js");
require("pai.js");
require("room.js");
require("message_type.js");
var server = new JServer();
var ret = server.Init({
    max_client:50
});
Debug.Log("init server ret:"+ret);
server.Start();

// function start(){
//     this.pai_list=[];
//     this.pai_list[0] = new PaiNode(1,1);
//     this.pai_list[1] = new PaiNode(1,1);
//     this.pai_list[2] = new PaiNode(1,1);
//     this.pai_list[3] = new PaiNode(1,1);
//     this.pai_list[4] = new PaiNode(1,2);
//     this.pai_list[5] = new PaiNode(1,3);
//     this.pai_list[6] = new PaiNode(1,3);
//     this.pai_list[7] = new PaiNode(1,3);
//     this.pai_list[8] = new PaiNode(1,3);
//     this.pai_list[9] = new PaiNode(1,4);
//     this.pai_list[10] = new PaiNode(1,4);
//     this.pai_list[11] = new PaiNode(1,4);
//     this.pai_list[12] = new PaiNode(2,5);
//     this.pai_list[13] = new PaiNode(2,5);
//     var check=new CheckPaiNode();
//     check.SetPais(this.pai_list);
//     check.CheckWin();
// }
// start();