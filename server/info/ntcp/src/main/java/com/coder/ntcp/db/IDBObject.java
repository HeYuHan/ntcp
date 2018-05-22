package com.coder.ntcp.db;

import org.springframework.data.mongodb.core.query.Update;

public interface IDBObject {
	public String getUid();
	public void onUpdate(Update update);
	public Object getObject();
}
