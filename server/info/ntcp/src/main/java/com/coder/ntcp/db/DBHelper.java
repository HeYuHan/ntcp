package com.coder.ntcp.db;
import java.util.List;
import java.util.Map.Entry;
import java.util.Calendar;
import java.util.Date;
import java.util.Iterator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import com.coder.ntcp.controller.ReqRoomCardOption;

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
	
	
	public List<Room> cleanRoomCardByHour(int hour) {
		Calendar calendar = Calendar.getInstance(); 
		calendar.add(Calendar.HOUR, -hour); 
	    Date todayStart = calendar.getTime();
		Criteria criteria = Criteria.where("timeOut").is(false);
		criteria.and("createTime").lt(todayStart); 
		criteria.and("canUseCount").gt(0);
		Query query = new Query(criteria);
//		List<RoomCard> roomCards = mongoTemplate.find(query, RoomCard.class);
//		if(roomCards == null )return;
//		for(int i=0;i<roomCards.size();i++) {
//			RoomCard card = roomCards.get(i);
//			card.timeOut=true;
//			Room room = Room.getRoom(card.getUid());
//			if(room != null)Room.freeRoom(room);
//		}
		Update update = new Update();
		update.set("timeOut", true);
		mongoTemplate.updateMulti(query, update, RoomCard.class);
		return Room.freeRoomsByDateBefore(todayStart);
		//return roomCard;
	}
	public List<RoomCard> getRecoveryRoomCard(int hour){
		Calendar calendar = Calendar.getInstance(); 
		calendar.add(Calendar.HOUR, -hour); 
	    Date todayStart = calendar.getTime();
		Criteria criteria = Criteria.where("timeOut").is(false);
		criteria.and("createTime").gt(todayStart);
		criteria.and("canUseCount").gt(0);
		Query query = new Query(criteria);
		return mongoTemplate.find(query, RoomCard.class);
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
	public void findUsers(DBPageResult<User> result)
	{
		Criteria criteria = Criteria.where("isProxy").is(false);
	    Query query = new Query(criteria);
	    result.totle=mongoTemplate.count(query, User.class);
	    query.skip(result.offest);
	    query.limit(result.limit);
	    result.result = mongoTemplate.find(query, User.class);
	}
	public void findProxys(DBPageResult<User> result)
	{
		Criteria criteria = Criteria.where("isProxy").is(true);
	    Query query = new Query(criteria);
	    result.totle=mongoTemplate.count(query, User.class);
	    query.skip(result.offest);
	    query.limit(result.limit);
	    result.result = mongoTemplate.find(query, User.class);
	}
}
