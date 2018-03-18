var express = require('express');
var Common = require('../private/common');
var DBHelper=require('../db/DBHelper').Instance;
var crypto = require('crypto');
var RoomIDCreater = new Common.RandomInt(100000,999999);
var router = express.Router();




function MD5(str){
  return crypto.createHash("md5").update(str).digest('hex');
}

function Room(){
  this.roomid=0;
  this.openid="";
  this.timestamp = Date.now();
  this.hashcode="";
  this.playcount=0;
};
Room.prototype.CaculateHash=function(){
  this.hashcode = MD5(this.roomid.toString() + this.openid + this.timestamp.toString());
}
var GlobalRoom={};
async function CreateRoom(openid){
  try {
    
    var id= RoomIDCreater.Get();
    var room = new Room();
    room.openid=openid;
    room.roomid = id;
    room.CaculateHash();
    let insert_ret = await DBHelper.InsertRoom(room);
    if(insert_ret.length > 0) {
      return insert_ret[0];
      GlobalRoom[room.roomid.toString()]=insert_ret[0];
    }
    return null;
  } catch (error) {
    console.error("create room:"+error.message);
    return null;
  }
    
}
async function SyncRoomToDB(){
  for(var key in GlobalRoom){
    var room =GlobalRoom[key];
    if(room){
      let ret = await DBHelper.UpdateRoom(room.hashcode,room);
      if(!(ret.ok && ret.n>0)){
        console.error("sync room data:"+room.hashcode);
      }
    }
  }
}
function GetRoom(roomid){
  return GlobalRoom[roomid];
}
function ReleaseRoom(roomid){
  var room = GlobalRoom[roomid];
  if(room){
    RoomIDCreater.ReleaseValue(parseInt(roomid));
    delete GlobalRoom[roomid];
    
  }
}
var ERROR_NONE=0;
var ERROR_USER_NOT_FOUND = 10001;
var ERROR_ROOM_IS_FULL = 10002;
var ERROR_ROOM_NOT_FOUND = 10003;
var ERROR_PARSE_ARG = 10004;
var ERROR_UPDATE_ROOM_INFO = 10005;
function ParseGetArg(req,res,query){
  try {
    var data = decodeURIComponent(req.query[query]);
    var json=JSON.parse(data);
    return json;
  } catch (error) {
    console.error("parse get arg:"+error.message);
    res.send({error:ERROR_PARSE_ARG,msg:req.query})
    return null;
  }
  
}
//跨域
router.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/public/getUserInfo',function(req,res,next){
    var arg = ParseGetArg(req,res,"data");
    if(!arg)return;
    if(!arg.openid){
      res.send({
        error:ERROR_USER_NOT_FOUND
      })
      return;
    }
    DBHelper.GetUserInfo(arg.openid,true).then((data,error)=>{
      if(data.length>0){
        res.send(data[0]);
      }
      else res.send({error:ERROR_USER_NOT_FOUND});
    });
});
router.get('/public/createRoom',function(req,res,next){
  var arg = ParseGetArg(req,res,"data");
  if(!arg || !arg.openid)return;
  DBHelper.GetUserInfo(arg.openid).then((data,error)=>{
    if(data.length == 0){
      res.send({
        error:ERROR_USER_NOT_FOUND
      });
    }
    else{
      CreateRoom(arg.openid).then(room=>{
        if(room){
          res.send({
            roomid:room.roomid
          });
        }
        else{
          res.send({
            error:ERROR_ROOM_IS_FULL
          });
        }
      });
    }
  });
});
router.get('/public/getUserRoom',function(req,res,next){
  var data = ParseGetArg(req,res,"data");
  if(!data)return;
  DBHelper.GetUserRoom(data.openid).then(ret=>
  {
    res.send(ret);
  });
});
//request in channel only
router.get('/private/checkRoom',function(req,res,next){
  var data = ParseGetArg(req,res,"data");
  if(!data)return;
  var roomid = data.roomid;
  var room = GetRoom(roomid);
  if(room){
    res.send(room);
  }else
  {
    res.send({error:ERROR_ROOM_NOT_FOUND});
  }
});
//request in channel only
router.get('/private/releaseRoom',function(req,res,next){
  var roomid = req.query.roomid;
  var hashcode = req.query.hashcode;
  var room = GetRoom(roomid);
  if(room && room.hashcode == hashcode){
    ReleaseRoom(roomid);
    res.send({error:ERROR_NONE});
  }
  else{
    res.send({error:ERROR_ROOM_NOT_FOUND});
  }
});
//request in channel only
router.get('/playEnd',function(req,res,next){
  console.log("playEnd:"+req.query.data);
  var data = ParseGetArg(req,res,"data");
  if(!data) return;
  var roomid = data.roomid;
  var hashcode = data.hashcode;
  var room = GetRoom(roomid);
  if(room && room.hashcode == hashcode){
    room.playcount++;
    res.send(room);
    
  }
  else{
    res.send({error:ERROR_ROOM_NOT_FOUND});
  }
});

module.exports = router;
