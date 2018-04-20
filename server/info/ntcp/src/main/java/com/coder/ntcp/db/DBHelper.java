package com.coder.ntcp.db;
import java.util.List;
import java.util.Calendar;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

@Component
public class DBHelper {
	public DBHelper() {
		System.out.println("create dbhelper");
	}
	@Autowired
    private MongoTemplate mongoTemplate;
	public void saveObject(IDBObject dbobj) {
		mongoTemplate.save(dbobj.getObject());
	}
	public <T> T findObject(IDBObject dbobj,Class<T> entityClass) {
		Query query = new Query(Criteria.where("uid").is(dbobj.getUid()));
		T t = mongoTemplate.findOne(query, entityClass);
		return t;
		
	}
	public <T> T findObjectByUid(String uid,Class<T> entityClass) {
		Query query = new Query(Criteria.where("uid").is(uid));
		T t = mongoTemplate.findOne(query, entityClass);
		return t;
		
	}
	public void updateObject(IDBObject dbobj,boolean autoCreate) {
		Query query = new Query(Criteria.where("uid").is(dbobj.getUid()));
		Update update = new Update();
		dbobj.onUpdate(update);
		if(autoCreate) {
			mongoTemplate.upsert(query, update, dbobj.getObject().getClass());
		}
		else {
			mongoTemplate.updateFirst(query, update, dbobj.getObject().getClass());
		}
	}
	public void deleteObject(IDBObject dbobj) {
		deleteObjectByKey(dbobj.getUid(),dbobj.getObject().getClass());
	}
	public void deleteObjectByKey(String key,Class<?> entityClass) {
		Query query=new Query(Criteria.where("uid").is(key));
		mongoTemplate.remove(query,entityClass);
	}
	
	
	public RoomCard findUnuseCard(String ownerid) {
		Criteria criteria = Criteria.where("ownerid").is(ownerid);
		criteria.and("canUseCount").gt(0);
		Query query = new Query(criteria);
		RoomCard roomCard = mongoTemplate.findOne(query, RoomCard.class);
		return roomCard;
	}
	public List<RoomRecoder> findRoomRecoderByDay(String userid,int daycount) {
		Calendar calendar = Calendar.getInstance(); 
		Date endStart = calendar.getTime();
		calendar.add(Calendar.DATE, -daycount); 
	    Date todayStart = calendar.getTime();
	    
	    
	    Criteria criteria = Criteria.where("players").is(userid);
	    criteria.and("createTime").gte(todayStart).lte(endStart); 
	    Query query = new Query(criteria);
	    return mongoTemplate.find(query, RoomRecoder.class);
	}
}
