class Task{
    private sender:any;
    private arg:any;
    private callback:Function;
    private time_out:number;
    public time_begin:number;
    constructor(sender,arg,callback,time_out)
    {
        this.sender=sender;
        this.arg = arg;
        this.callback=callback;
        this.time_out=time_out;
    }
    public Rest(){
        this.time_begin=0;
    }

    public Call(){
        if(this.callback)this.callback(this.sender,this.arg);
    }
    public IsTimeOut():boolean{
        return this.time_begin>this.time_out;
    }
}
class JServer{
    private native:Server;
    private tasks:Array<Task>=[];
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
    public AddTask(task:Task){
        task.Rest();
        this.tasks.push(task);
    }
    public OnUpdate(frame:number){
        //LogInfo("server update:"+frame);
        for(var i=0;i<this.tasks.length;i++){
            this.tasks[i].time_begin+=frame;
            if(this.tasks[i].IsTimeOut()){
                this.tasks[i].Call();
                this.tasks.slice(i,1);
            }
        }
    }
}