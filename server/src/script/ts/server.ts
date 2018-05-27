class JServer{
    private native:Server;
    constructor(){
        this.native=Server.Get();
        this.native.OnAccept=this.OnAccept;
        var content=this;
        this.native.OnUpdate=(t)=>{content.OnUpdate(t);}
    }
    public OnAccept(uid:number){
        LogInfo("accept new client uid:"+uid);
        var client=new JClient(uid);
    }
    public Init(config):boolean{
        return this.native.Init(JSON.stringify(config));
    }
    public Start():number{
        return this.native.Start();
    }
    public OnUpdate(frame:number){
        //LogInfo("server update:"+frame);
    }
}