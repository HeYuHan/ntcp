package com.coder.ntcp.db;

import java.io.Serializable;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.query.Update;



@Document(collection="admin")
public class AdminUser implements IDBObject,Serializable{
	/**
	 * 
	 */
	private static final long serialVersionUID = 7320260117183518809L;
	public String uid;
	public String password;
	public String nick;
	public int level;
	
	@Override
	public String getUid() {
		// TODO Auto-generated method stub
		return uid;
	}
	@Override
	public void onUpdate(Update update) {
		// TODO Auto-generated method stub
		update.set("password", password);
		update.set("level", level);
		
	}
	@Override
	public Object getObject() {
		// TODO Auto-generated method stub
		return this;
	}
}
