package com.coder.ntcp.db;
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
}
