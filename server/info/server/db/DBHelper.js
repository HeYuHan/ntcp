
var MongoClient = require('mongodb');
var DBHelper=(function(){
    function DBHelper(){
    }
    DBHelper.Instance = new DBHelper();
    DBHelper.Connect= async function (url,data_base){
        var db = await MongoClient.connect(url);
        DBHelper.Instance.db=db;
        DBHelper.Instance.db_base=db.db(data_base);
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
            await collection.insert(new_recoder);
            return new_recoder;
        }
        return array;
    }
    DBHelper.prototype.GetAllUser= async function(){
        let collection = await this.db_base.collection('user');
        let ret = await collection.find({});
        return ret.toArray();
    }
    DBHelper.prototype.UpdateUser=async function(key,value,multi){
        let collection = await this.db_base.collection('user');
        return await collection.update(key,{$set:value},{multi:multi?true:false});
    }
    return DBHelper;
}());

module.exports=DBHelper;