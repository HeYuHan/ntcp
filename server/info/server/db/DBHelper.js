
var MongoClient = require('mongodb');


var DBHelper=(function(){
    function DBHelper(){
    }
    DBHelper.Instance = new DBHelper();

    var db_con_call_back=[];
    DBHelper.prototype.addDBConnectedCallback=function(sender,call){
        db_con_call_back.push({
            sender:sender,
            call:call
        });
    }
    function OnDBConnected(){
        for(var i=0;i<db_con_call_back.length;i++){
            var c = db_con_call_back[i];
            if(c.sender && c.call)c.call.call(c.sender);
        }
        db_con_call_back=[];
    }
    DBHelper.Connect= async function (url,data_base){
        var db = await MongoClient.connect(url);
        DBHelper.Instance.db=db;
        DBHelper.Instance.db_base=db.db(data_base);
        OnDBConnected();
        return DBHelper.Instance;
    }
    DBHelper.prototype.GetUserInfo= async function(openid,auto_create){
        let collection = await this.db_base.collection('user');
        let ret = await collection.find({openid:openid});
        var array = await ret.toArray();
        if(auto_create && array.length == 0){
            var new_recoder={
                openid:openid,
                proxy:false,
                diamond:0,
                gold:500
            }
            let insert_ret =  await collection.insert(new_recoder);
            if(insert_ret.result.ok){
                return insert_ret.ops;
            }
            else {
                return [];
            }
        }
        return array;
    }
    DBHelper.prototype.GetAllUser= async function(){
        let collection = await this.db_base.collection('user');
        let ret = await collection.find({});
        return ret.toArray();
    }
    DBHelper.prototype.UpdateUser=async function(openid,value){
        let collection = await this.db_base.collection('user');
        return await collection.update({openid:openid},{$set:value},{multi:false}).result;
    }
    DBHelper.prototype.UpdateOrInsertRoomCard = async function(card){
        let collection = await this.db_base.collection("room_card");
        return await collection.update({cardid:card.cardid},{$set:card},{multi:false,upsert:true});
    }

    DBHelper.prototype.GetUserRoom= async function(openid){
        let collection = await this.db_base.collection('room');
        let ret = await collection.find({openid:openid});
        return ret.toArray();
    }
    DBHelper.prototype.InsertRoom=async function(room){
        if(!room.hashcode)return [];
        let collection = await this.db_base.collection('room');
        let find_ret = await collection.find({hashcode:room.hashcode}).toArray();
        if(find_ret.length > 0){
            return find_ret;
        }
        let insert_ret =  await collection.insert(room);
        if(insert_ret.result.ok){
            return insert_ret.ops;
        }
        else {
            return [];
        }
    }
    DBHelper.prototype.UpdateRoom=async function(hashcode,value){
        let collection = await this.db_base.collection('room');
        let ret = await collection.update({hashcode:hashcode},{$set:value},{multi:false});
        return ret.result;
    }
    return DBHelper;
}());

module.exports=DBHelper;