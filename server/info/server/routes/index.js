var express = require('express');
var Common = require('../private/common');
var DBHelper=require('../db/DBHelper').Instance;


var router = express.Router();
var RoomIDCreater = new Common.RandomInt(100000,999999);

var GlobalRoom={};
function CreateRoomID(){
    var id= RoomIDCreater.Get().toString();
    GlobalRoom[id]={};
}
function ReleaseRoomID(id){
    if(GlobalRoom[id]){
      delete GlobalRoom[id];
      RoomIDCreater.ReleaseValue(parseInt(id));
    }
}
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/getUserInfo',function(req,res,next){
    var openid = req.query.openid;
    DBHelper.GetUserInfo(openid,true).then((data,error)=>{
      res.send(data);
    });
});
router.get('/createRoom',function(req,res,next){

});
module.exports = router;
