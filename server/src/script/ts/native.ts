declare class Server{
    public OnAccept:(uid:number)=>void;
    public OnUpdate:(frame:null)=>void;
    public Init(json:string):boolean;
    public Start():number;
    public static Get():Server;
    public static Platfrom():number;
}
declare class Client{
    public static Get(uid:number):Client;
    public Disconnect();
    public Send(msg:string);
    public CloseOnSendEnd();
    //public SendNString(msg:NString);
    public OnMessage:(msg:string)=>void;
    public OnConnected:()=>void;
    public OnDisconected:()=>void;
    
}
declare class FileHelper{
    public static LoadScript(path:string):boolean;
    public static Write(path:string,msg:string):boolean;
    public static Read(path:string):string;
    public static MainScriptPath():string;
}
declare class Timer{
    constructor(timer:number,loop:boolean);
    public OnUpdate:(frame_time:number)=>void;
    public Begin();
    public Stop();
    public Free();
}
declare class Http{
    public OnResponse:(state:number,data:string)=>void;
    //public Get(url:string):boolean;
    public Post(url:string,data:string,type:string):boolean;
    public Post2(url:string,data:string,type:string):string;
    public Free();
}
// declare class NString{
//     public Append(msg:string);
//     public Get():string;
// }
class NString{
    private content:string="";
    public Append(msg:string){
        this.content+=msg;
    }
    public Get():string{
        return this.content;
    }
}
declare class Debug{
    public static Log(type:number,msg:any);
}
declare class AsyncFileWriter{
    constructor(path:string);
    public  Free():boolean;
    public  Write(content:string):boolean;
}

