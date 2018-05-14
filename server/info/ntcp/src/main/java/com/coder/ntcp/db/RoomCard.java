package com.coder.ntcp.db;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.query.Update;

import com.coder.ntcp.controller.ReqRoomCardOption;

@Document(collection="card")
public class RoomCard implements Serializable,IDBObject{


	public String ownerid;
	public String uid;
	public int maxUseCount=0;
	public int canUseCount=0;
	public RoomCardPayType payType;
	public int[] balanceRate=new int[3];
	public boolean includexi=true;
	//public boolean isPay;
	public Date createTime;
	public boolean timeOut;
	public int roomid;
	public int price;
	public CurrencyType currencyType;
	@Override
	public String getUid() {
		// TODO Auto-generated method stub
		return this.uid;
	}
	@Override
	public void onUpdate(Update update) {
		// TODO Auto-generated method stub
		update.set("canUseCount", canUseCount);
		//update.set("isPay", isPay);
	}
	@Override
	public Object getObject() {
		// TODO Auto-generated method stub
		return this;
	}
	public static RoomCard create(User user,ReqRoomCardOption option,DBHelper dbHelper) throws Exception {
		RoomCard card = new RoomCard();
		CurrencyType currencyType=CurrencyType.None;
		try {
			currencyType=CurrencyType.valueOf(option.currencyType);
		} catch (Exception e) {
			// TODO: handle exception
			currencyType=CurrencyType.None;
		}
		if(currencyType == CurrencyType.None)throw new Exception("ERROR_CURRENCY_TYPE");
		
		RoomCardPayType payType = RoomCardPayType.None;
		try {
			payType=RoomCardPayType.valueOf(option.payType);
		} catch (Exception e) {
			// TODO: handle exception
			payType=RoomCardPayType.None;
		}
		if(payType == RoomCardPayType.None)throw new Exception("ERROR_PAY_TYPE");
		
		Price price = dbHelper.findObjectByUid(Price.CaculateUid(ItemType.RoomCard,currencyType,option.playCount), Price.class);
		if(price == null)throw new Exception("ERROR_PRICE_NOT_FOUND");
		//if(option.playCount != PLAY_COUNT_6 && option.playCount!=PLAY_COUNT_12) throw new Exception("ERROR_PLAY_COUNT");
		//if(option.payType<1||option.payType>3)throw new Exception("ERROR_PAY_TYPE");
		//if(option.balanceRate<1||option.balanceRate>3)throw new Exception("ERROR_RATE_TYPE");
//		if(option.playCount == PLAY_COUNT_6) {
//			if(user.diamondCount<3)throw new Exception("ERROR_DIAMOND_NOT_FULL");
//			user.diamondCount-=3;
//			dbHelper.updateObject(user, false);
//			card.isPay=true;
//		}
//		else if(option.playCount == PLAY_COUNT_12) {
//			if(user.diamondCount<6)throw new Exception("ERROR_DIAMOND_NOT_FULL");
//			user.diamondCount-=6;
//			dbHelper.updateObject(user, false);
//			card.isPay=true;
//		}
		
		card.roomid=Room.getRandomId();
		card.ownerid=user.uid;
		card.uid=DigestUtils.md5Hex(user.uid+System.currentTimeMillis());
		card.includexi=option.includexi;
		card.payType=payType;
		card.price=price.price;
		card.currencyType=currencyType;
		card.maxUseCount=option.playCount;
		card.canUseCount=card.maxUseCount;
		card.balanceRate[0]=1;
		card.balanceRate[1]=1;
		card.balanceRate[2]=1;
		card.createTime=new Date();
		card.timeOut=false;
		dbHelper.saveObject(card);
		return card;
	}
}
