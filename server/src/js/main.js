File.LoadScript("E:/Share/ntcp_server/src/js/tools.js");
ScriptLoader.ROOT_PATH="E:/Share/ntcp_server/src/js/";
require("server.js");
// Http.prototype.OnResponse=function(state,data){
//     Debug.Log(state);
//     Debug.Log(data);
// }
// var http=new Http();
// http.Get("https://www.baidu.com");
var value=[1,2,3,4]
for(var i in value)
{
    Debug.Log("ff:"+i);
}