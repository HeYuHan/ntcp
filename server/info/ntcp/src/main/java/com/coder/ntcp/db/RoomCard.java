package com.coder.ntcp.db;

import java.io.Serializable;
import java.util.ArrayList;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.query.Update;

import com.coder.ntcp.controller.ReqRoomCardOption;

@Document(collection="card")
public class RoomCard implements Serializable,IDBObject{

	public final static int PAY_HOST=1;
	public final static int PAY_WINER=2;
	public final static int PAY_AA =3;
	public final static int PLAY_COUNT_6=6;
	public final static int PLAY_COUNT_12=12;

	public String ownerid;
	public String uid;
	public int maxUseCount=PLAY_COUNT_6;
	public int canUseCount=0;
	public int payType=PAY_HOST;
	public int blanceRate=1;
	public boolean includexi=true;
	public boolean isPay;
	@Override
	public String getUid() {
		// TODO Auto-generated method stub
		return this.uid;
	}
	@Override
	public void onUpdate(Update update) {
		// TODO Auto-generated method stub
		update.set("canUseCount", canUseCount);
		update.set("isPay", isPay);
	}
	@Override
	public Object getObject() {
		// TODO Auto-generated method stub
		return this;
	}
	public int getCost() {
		if(this.maxUseCount == PLAY_COUNT_6 ) {
			return 3;
		}
		else if(this.maxUseCount == PLAY_COUNT_12 ) {
			return 6;
		}
		return 0;
	}
	public static RoomCard create(User user,ReqRoomCardOption option,DBHelper dbHelper) throws Exception {
		RoomCard card = new RoomCard();
		//if(!user.isProxy)throw new Exception("ERROR_USER_IS_NOT_PROXY");
		if(option.playCount != PLAY_COUNT_6 && option.playCount!=PLAY_COUNT_12) throw new Exception("ERROR_PLAY_COUNT");
		if(option.payType<1||option.payType>3)throw new Exception("ERROR_PAY_TYPE");
		if(option.blanceRate<1||option.blanceRate>3)throw new Exception("ERROR_RATE_TYPE");
		if(option.playCount == PLAY_COUNT_6) {
			if(user.diamondCount<3)throw new Exception("ERROR_DIAMOND_NOT_FULL");
			user.diamondCount-=3;
			dbHelper.updateObject(user, false);
			card.isPay=true;
		}
		else if(option.playCount == PLAY_COUNT_12) {
			if(user.diamondCount<6)throw new Exception("ERROR_DIAMOND_NOT_FULL");
			user.diamondCount-=6;
			dbHelper.updateObject(user, false);
			card.isPay=true;
		}
		
		card.ownerid=user.uid;
		card.uid=DigestUtils.md5Hex(user.uid+System.currentTimeMillis());
		card.includexi=option.includexi;
		card.payType=option.payType;
		card.maxUseCount=option.playCount;
		card.canUseCount=card.maxUseCount;
		card.blanceRate=Math.max(1, option.blanceRate);
		dbHelper.saveObject(card);
		return card;
	}
}
