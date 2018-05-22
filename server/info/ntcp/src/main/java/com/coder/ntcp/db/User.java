package com.coder.ntcp.db;

import static org.assertj.core.api.Assertions.setAllowComparingPrivateFields;

import java.io.Serializable;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.query.Update;


@Document(collection="user")

public class User implements Serializable,IDBObject{
	/**
	 * 
	 */
	private static final long serialVersionUID = 4341213811359729391L;

	public String uid;
	public String openid;
	public String nick;
	public String token;
	public String headimgurl;
	public int goldCount;
	public int diamondCount;
	public boolean isProxy;
	
	@Override
	public String getUid() {
		return uid;
	}
	@Override
	public void onUpdate(Update update) {
		update.set("goldCount", goldCount)
		.set("diamondCount", diamondCount)
		.set("isProxy", isProxy)
		.set("nick", nick)
		.set("headimgurl", headimgurl)
		.set("token", token);
	}
	@Override
	public Object getObject() {
		// TODO Auto-generated method stub
		return this;
	}
}
