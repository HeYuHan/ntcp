var today=null;
function calljs(t1,t2,t3){
    today = Date(); today.toString();
    today +=t2;
    return "nihao"
}
var gServer=Server.Get();
Server.prototype.OnAccept=function(uid){
    var client=Client.Get(uid);
    client.OnMessage=function(msg)
    {
        var json=JSON.parse(msg);
        Debug.Log("你好:"+json.msg);
        client.Send("xxxxxx-----你好:"+json.msg);
        //client.Disconnect();
    }
    client.OnDisconected=function()
    {
        Debug.Log("OnDisconected:"+uid);
    }
    
}
var timer=new Timer(1,false);
var i=0;
timer.OnUpdate=function(t)
{
    i++;
    Debug.Log("timer update time:"+t+" i:"+i);
    if(i>2)timer.Stop();
}
timer.Begin();
File.LoadScript("E:\\Share\\ntcp_server\\exe\\test.js");
say("sdaffffdffffffffffff")