package com.coder.ntcp.db;

import static org.assertj.core.api.Assertions.setAllowComparingPrivateFields;

import java.io.Serializable;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.query.Update;

import lombok.Getter;
import lombok.Setter;

@Document(collection="user")

public class User implements Serializable,IDBObject{
	/**
	 * 
	 */
	private static final long serialVersionUID = 4341213811359729391L;

	public String uid;
	public String openid;
	public int glodCount;
	public int diamondCount;
	public boolean isProxy;
	@Override
	public String getUid() {
		return uid;
	}
	@Override
	public void onUpdate(Update update) {
		update.set("glodCount", glodCount)
		.set("diamondCount", diamondCount)
		.set("isProxy", isProxy)
		.set("openid", openid);
	}
	@Override
	public Object getObject() {
		// TODO Auto-generated method stub
		return this;
	}
}
