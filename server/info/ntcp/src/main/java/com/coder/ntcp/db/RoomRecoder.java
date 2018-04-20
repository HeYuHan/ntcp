package com.coder.ntcp.db;

import java.io.Serializable;
import java.util.Date;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.query.Update;

@Document(collection="play_recoder")
public class RoomRecoder implements Serializable,IDBObject{
	public String uid;
	public String cardid;
	public int roomid;
	public String[] players;
	public int useIndex;
	public Date createTime;
	@Override
	public String getUid() {
		// TODO Auto-generated method stub
		return uid;
	}
	@Override
	public void onUpdate(Update update) {
		// TODO Auto-generated method stub
		
	}
	@Override
	public Object getObject() {
		
		// TODO Auto-generated method stub
		return this;
	}
	public void caculateUid() {
		this.uid=DigestUtils.md5Hex(cardid+Integer.toString(this.roomid)+Integer.toString(this.useIndex));
	}
	public static RoomRecoder create(Room room,String[] players) {
		
		RoomRecoder recoder = new RoomRecoder();
		RoomCard card=room.getRoomCard();
		recoder.cardid=card.getUid();
		recoder.roomid=room.getRoomId();
		recoder.players=players;
		recoder.useIndex=card.maxUseCount - card.canUseCount;
		recoder.createTime=new Date();
		recoder.caculateUid();
		return recoder;
	}
	public static RoomRecoder createTest() {
		
		RoomRecoder recoder = new RoomRecoder();
		recoder.cardid="abcdef"+Integer.toString((int)(Math.random()*100000));
		recoder.roomid=(int)(Math.random()*100000);
		recoder.players=new String[3];
		recoder.players[0]="admin1";
		recoder.players[1]="admin2";
		recoder.players[2]="admin3";
		recoder.useIndex=(int)(Math.random()*13);
		recoder.createTime=new Date();
		recoder.caculateUid();
		return recoder;
	}
}
