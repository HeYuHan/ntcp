declare class Server{
    public OnAccept:(uid:number)=>void;
    public GetMaxClient():number;
    public static Get():Server;
}
declare class Client{
    public static Get(uid:number):Client;
    public Disconnect();
    public Send(msg:string);
    public SendNString(msg:NString);
    public OnMessage:(msg:string)=>void;
    public OnConnected:()=>void;
    public OnDisconected:()=>void;
}
declare class FileHelper{
    public static LoadScript(path:string):boolean;
    public static Write(path:string,msg:string):boolean;
    public static Read(path:string):string;
}
declare class Timer{
    constructor(timer:number,loop:boolean);
    public OnUpdate:(frame_time:number)=>void;
    public Begin();
    public Stop();
}
declare class Http{
    public OnResponse:(state:number,data:string)=>void;
    public Get(url:string):boolean;
    public Post(url:string,data:string):boolean;
}
declare class NString{
    public Append(msg:string);
    public Get():string;
}
declare class Debug{
    public static Log(msg:any);
}

