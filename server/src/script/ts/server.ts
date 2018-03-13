class JServer{
    private native:Server;
    constructor(){
        this.native=Server.Get();
        this.native.OnAccept=this.OnAccept;
    }
    public OnAccept(uid:number){
        Debug.Log("accept new client uid:"+uid);
        var client=new JClient(uid);
    }
    public static Start(){
        new JServer();
    }
}