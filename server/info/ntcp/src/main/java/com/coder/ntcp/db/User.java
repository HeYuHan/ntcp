package com.coder.ntcp.db;

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

	String uid;
	int glodCount;
	int diamondCount;
	boolean isProxy;
	String nick;
	@Override
	public String getUid() {
		return uid;
	}
	@Override
	public void onUpdate(Update update) {
		update.set("glodCount", glodCount);
	}
	@Override
	public Object getObject() {
		return this;
	}
	public int getGlodCount() {
		return glodCount;
	}
	public void setGlodCount(int glodCount) {
		this.glodCount = glodCount;
	}
	public int getDiamondCount() {
		return diamondCount;
	}
	public void setDiamondCount(int diamondCount) {
		this.diamondCount = diamondCount;
	}
	public boolean isProxy() {
		return isProxy;
	}
	public void setProxy(boolean isProxy) {
		this.isProxy = isProxy;
	}
	public String getNick() {
		return nick;
	}
	public void setNick(String nick) {
		this.nick = nick;
	}
	public void setUid(String uid) {
		this.uid = uid;
	}
}
