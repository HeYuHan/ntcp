var express = require('express');
var Common = require('../private/common');
var DBHelper=require('../db/DBHelper').Instance;
var crypto = require('crypto');
var RoomIDCreater = new Common.RandomInt(100000,999999);
var router = express.Router();

function MD5(str){
  return crypto.createHash("md5").update(str).digest('hex');
}
let ROOM_PAY_HOST=1;
let ROOM_PAY_WIN=2;
let ROOM_PAY_AA=3;
function RoomCard(){
  //谁开的
  this.host="";
  //可使用次数
  this.maxusecount=0;
  //倍率
  this.rate=1;
  //带喜牌
  this.includexi=true;
  //支付方式
  this.paytype=1;
  this.cardid=0;

  //已使用次数
  this.usedcount=0;

  this.timestamp=0;

}

let ROOM_PLAY_COUNT6=[6,3];
let ROOM_PLAY_COUNT12=[12,6];

async function CreateRoomCard(openid,usecount,includexi,paytype){
  if(!paytype)paytype=ROOM_PAY_HOST;
  var users = await DBHelper.GetUserInfo(openid,false);
  if(users.length == 0)return {error:ERROR_USER_NOT_FOUND};
  var user = users[0];
  if(usecount == ROOM_PLAY_COUNT6[0]){
    if(user.diamond<ROOM_PLAY_COUNT6[1])return{error:ERROR_DIAMOND_TOO_LESS};
  }
  else if(usecount == ROOM_PLAY_COUNT12[0]){
    if(user.diamond<ROOM_PLAY_COUNT12[1])return{error:ERROR_DIAMOND_TOO_LESS};
  }
  else {
    return{error:ERROR_ROOM_PLAY_COUNT_ERROR};
  }
  var room_card = new RoomCard();
  room_card.host=openid;
  room_card.timestamp=Date.now();
  room_card.cardid=MD5(openid+room_card.timestamp.toString());
  room_card.maxusecount=usecount;
  room_card.usedcount=0;
  room_card.includexi=includexi?false:true;
  room_card.paytype=paytype;
  var  ret = await DBHelper.UpdateOrInsertRoomCard(room_card);
  console.log(ret);
  return ret;
}
DBHelper.addDBConnectedCallback(this,()=>{
  CreateRoomCard("18516606748",6,true,1);
});


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
      GlobalRoom[room.roomid.toString()]=insert_ret[0];
      return insert_ret[0];
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
  return GlobalRoom[roomid.toString()];
}
function ReleaseRoom(roomid){
  var room = GlobalRoom[roomid.toString()];
  if(room){
    RoomIDCreater.ReleaseValue(parseInt(roomid));
    delete GlobalRoom[roomid.toString()];
    
  }
}
var ERROR_NONE=0;
var ERROR_USER_NOT_FOUND = 10001;
var ERROR_ROOM_IS_FULL = 10002;
var ERROR_ROOM_NOT_FOUND = 10003;
var ERROR_PARSE_ARG = 10004;
var ERROR_UPDATE_ROOM_INFO = 10005;
var ERROR_DIAMOND_TOO_LESS = 10006;
var ERROR_ROOM_PLAY_COUNT_ERROR = 10007;
function ParseGetArg(req,res,query){
  try {
    var json=JSON.parse(decodeURIComponent(req.query[query]));
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
// //request in channel only
// router.get('/private/releaseRoom',function(req,res,next){
//   var roomid = req.query.roomid;
//   var hashcode = req.query.hashcode;
//   var room = GetRoom(roomid);
//   if(room && room.hashcode == hashcode){
//     ReleaseRoom(roomid);
//     res.send({error:ERROR_NONE});
//   }
//   else{
//     res.send({error:ERROR_ROOM_NOT_FOUND});
//   }
// });
//request in channel only
router.get('/private/playEnd',function(req,res,next){
  console.log("playEnd:"+req.query.data);
  var data = ParseGetArg(req,res,"data");
  if(!data) return;
  var roomid = data.info.roomid;
  var hashcode = data.info.hashcode;
  var room = GetRoom(roomid);
  if(room && room.hashcode == hashcode){
    room.playcount++;
    res.send(room);
    //ReleaseRoom(roomid);
  }
  else{
    res.send({error:ERROR_ROOM_NOT_FOUND});
  }
});
//check enter room
router.get('/private/getUserInfo',function(req,res,next){
  var arg = ParseGetArg(req,res,"data");
  if(!arg)return;
  if(!arg.openid){
    res.send({
      error:ERROR_USER_NOT_FOUND
    })
    return;
  }
  DBHelper.GetUserInfo(arg.openid,false).then((data,error)=>{
    if(data.length>0){
      res.send(data[0]);
    }
    else res.send({error:ERROR_USER_NOT_FOUND});
  });
});
module.exports = router;
