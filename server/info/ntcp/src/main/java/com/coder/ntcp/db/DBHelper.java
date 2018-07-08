package com.coder.ntcp.db;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.locks.ReentrantLock;
import java.util.regex.Pattern;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
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
	public static DBHelper gDbHelper;
	public DBHelper() {
		gDbHelper = this;
	}
	private ReentrantLock lock = new ReentrantLock();
	@Autowired
    private MongoTemplate mongoTemplate;
	public void initDB() {
		if(mongoTemplate.findAll(Price.class).size()==0) {
			Price price=new Price();
			price.itemType=ItemType.RoomCard;
			price.currencyType=CurrencyType.Diamond;
			price.itemCount=1;
			price.price=1;
			price.uid=Price.CaculateUid(price);
			saveObject(price);
		}
		AdminUser user = findObjectByUid("root", AdminUser.class);
		if(user == null) {
			user = new AdminUser();
			user.level=5;
			user.nick="超级管理员";
			user.password="1234567";
			user.uid="root";
			saveObject(user);
		}
	}
	public void saveObject(IDBObject dbobj) {
		lock.lock();
		mongoTemplate.save(dbobj.getObject());
		lock.unlock();
	}
	public <T> T findObject(IDBObject dbobj,Class<T> entityClass) {
		lock.lock();
		Query query = new Query(Criteria.where("uid").is(dbobj.getUid()));
		T t = mongoTemplate.findOne(query, entityClass);
		lock.unlock();
		return t;
		
	}
	public <T> T findObjectByUid(String uid,Class<T> entityClass) {
		lock.lock();
		Query query = new Query(Criteria.where("uid").is(uid));
		T t = mongoTemplate.findOne(query, entityClass);
		lock.unlock();
		return t;
		
	}
	public void updateObject(IDBObject dbobj,boolean autoCreate) {
		lock.lock();
		Query query = new Query(Criteria.where("uid").is(dbobj.getUid()));
		Update update = new Update();
		dbobj.onUpdate(update);
		if(autoCreate) {
			mongoTemplate.upsert(query, update, dbobj.getObject().getClass());
		}
		else {
			mongoTemplate.updateFirst(query, update, dbobj.getObject().getClass());
		}
		lock.unlock();
	}
	public <T> void updateObjectValues(String uid,String key,Object value,Class<T> entityClass)
	{
		lock.lock();
		Query query = new Query(Criteria.where("uid").is(uid));
		Update update = new Update();
		update.set(key, value);
		mongoTemplate.updateFirst(query, update, entityClass);
		lock.unlock();
	}
	public <T> void updateObjectValues(String uid,HashMap<String,Object> map,Class<T> entityClass)
	{
		lock.lock();
		Query query = new Query(Criteria.where("uid").is(uid));
		Update update = new Update();
		for (Entry<String, Object> entry : map.entrySet()) {
			update.set(entry.getKey(), entry.getValue());
		}
		mongoTemplate.updateFirst(query, update, entityClass);
		lock.unlock();
	}
	public void deleteObject(IDBObject dbobj) {
		lock.lock();
		deleteObjectByKey(dbobj.getUid(),dbobj.getObject().getClass());
		lock.unlock();
	}
	public void deleteObjectByKey(String key,Class<?> entityClass) {
		lock.lock();
		Query query=new Query(Criteria.where("uid").is(key));
		mongoTemplate.remove(query,entityClass);
		lock.unlock();
	}
	
	
	public List<Room> cleanRoomCardByHour(int hour) {
		lock.lock();
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
		List<Room> ret=Room.freeRoomsByDateBefore(todayStart);
		lock.unlock();
		return ret;
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
		lock.lock();
		List<RoomCard> ret = mongoTemplate.find(query, RoomCard.class);
		lock.unlock();
		return ret;
	}
	
	public List<RoomRecoder> findRoomRecoderByDay(String userid,int daycount) {
		Calendar calendar = Calendar.getInstance(); 
		Date endStart = calendar.getTime();
		calendar.add(Calendar.DATE, -daycount); 
	    Date todayStart = calendar.getTime();
	    
	    
	    Criteria criteria = Criteria.where("players").is(userid);
	    criteria.and("createTime").gte(todayStart).lte(endStart); 
	    Query query = new Query(criteria);
	    lock.lock();
	    List<RoomRecoder> ret =mongoTemplate.find(query, RoomRecoder.class);
	    lock.unlock();
	    return ret;
	}
	public <T> void findAll(DBPageResult<T> result,Class<T> enteryClass) {
		
		result.result = mongoTemplate.findAll(enteryClass);
		
	}
	public <T> long getCount(Class<T> enteryClass) {
		lock.lock();
		long ret = mongoTemplate.count(new Query(), enteryClass);
		lock.unlock();
		return ret;
	}
	public void findUsers(DBPageResult<User> result)
	{
		Criteria criteria = Criteria.where("isProxy").is(false);
		Iterator<Entry<String, Object>> iterator = result.likeQuery.entrySet().iterator();
	    while (iterator.hasNext()) {
			Map.Entry<String, Object> entry=iterator.next();
			String key = entry.getKey();
			Object val = entry.getValue();
			Pattern pattern = Pattern.compile("^.*"+val+".*$", Pattern.CASE_INSENSITIVE);
			criteria.and(key).regex(pattern);
		}
	    Query query = new Query(criteria);
	    result.totle=mongoTemplate.count(query, User.class);
	    
	    query.skip(result.offest);
	    query.limit(result.limit);
	    lock.lock();
	    result.result = mongoTemplate.find(query, User.class);
	    lock.unlock();
	}
	public void findProxys(DBPageResult<User> result)
	{
		Criteria criteria = Criteria.where("isProxy").is(true);
		Iterator<Entry<String, Object>> iterator = result.likeQuery.entrySet().iterator();
	    while (iterator.hasNext()) {
			Map.Entry<String, Object> entry=iterator.next();
			String key = entry.getKey();
			Object val = entry.getValue();
			Pattern pattern = Pattern.compile("^.*"+val+".*$", Pattern.CASE_INSENSITIVE);
			criteria.and(key).regex(pattern);
		}
	    Query query = new Query(criteria);
	    result.totle=mongoTemplate.count(query, User.class);
	    query.skip(result.offest);
	    query.limit(result.limit);
	    lock.lock();
	    result.result = mongoTemplate.find(query, User.class);
	    lock.unlock();
	}
}
