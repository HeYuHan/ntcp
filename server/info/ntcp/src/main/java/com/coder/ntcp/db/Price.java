package com.coder.ntcp.db;

import java.io.Serializable;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.query.Update;
@Document(collection="price")
public class Price implements IDBObject,Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = -2321167518226615856L;
	public ItemType itemType;
	public CurrencyType currencyType;
	public int itemCount;
	public int price;
	public String uid;
	
	
	@Override
	public String getUid() {
		// TODO Auto-generated method stub
		return uid;
	}

	@Override
	public void onUpdate(Update update) {
		// TODO Auto-generated method stub
		update.set("price", price);
		
	}
	public static String CaculateUid(Price p) {
		return CaculateUid(p.itemType,p.currencyType,p.itemCount);
	}
	public static String CaculateUid(ItemType t1,CurrencyType t2,int count) {
		return DigestUtils.md5Hex(t1.toString()+t2.toString()+count);
	}
	@Override
	public Object getObject() {
		// TODO Auto-generated method stub
		return this;
	}
	
}
