package com.coder.ntcp.db;

import java.io.Serializable;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.query.Update;

import com.coder.ntcp.controller.ReqRoomCardOption;



@Document(collection="card")
public class RoomCard implements Serializable,IDBObject{
	final static int PAY_HOST=1;
	final static int PAY_WINER=2;
	final static int PAY_AA =3;
	final static int PLAY_COUNT_6=6;
	final static int PLAY_COUNT_12=12;

	public String ownerid;
	public String uid;
	public int maxUseCount=PLAY_COUNT_6;
	public int usedCount=0;
	public int payType=PAY_HOST;
	public int blanceRate=1;
	public boolean includexi=true;
	@Override
	public String getUid() {
		// TODO Auto-generated method stub
		return this.uid;
	}
	@Override
	public void onUpdate(Update update) {
		// TODO Auto-generated method stub
		update.set("usedCount", usedCount);
	}
	@Override
	public Object getObject() {
		// TODO Auto-generated method stub
		return this;
	}
	public static RoomCard create(User user,ReqRoomCardOption option) throws Exception {

		if(option.playCount != PLAY_COUNT_6 && option.playCount!=PLAY_COUNT_12) throw new Exception("ERROR_PLAY_COUNT");
		if(option.payType<1||option.payType>3)throw new Exception("ERROR_PAY_TYPE");
		if(option.blanceRate<1||option.blanceRate>3)throw new Exception("ERROR_RATE_TYPE");
		if(option.playCount == PLAY_COUNT_6) {
			if(user.diamondCount<3)throw new Exception("ERROR_DIAMOND_NOT_FULL");
			user.diamondCount-=3;
		}
		else if(option.playCount == PLAY_COUNT_12) {
			if(user.diamondCount<6)throw new Exception("ERROR_DIAMOND_NOT_FULL");
			user.diamondCount-=6;
		}
		RoomCard card = new RoomCard();
		card.ownerid=user.uid;
		card.uid=DigestUtils.md5Hex(user.uid+System.currentTimeMillis());
		card.includexi=option.includexi;
		card.payType=option.payType;
		card.maxUseCount=option.playCount;
		card.usedCount=0;
		card.blanceRate=option.blanceRate;
		return card;
	}
}
