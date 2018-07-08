package com.coder.ntcp.db;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.query.Update;

import com.coder.ntcp.controller.PlayerScore;

@Document(collection="play_recoder")
public class RoomRecoder implements Serializable,IDBObject{
	public String uid;
	public Date createTime;
	public int roomid;
	public String[] players=new String[9];
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
	public static RoomRecoder create(Room room,String[] players) {
		
		RoomRecoder recoder = new RoomRecoder();
		RoomCard card=room.getRoomCard();
		recoder.uid=card.getUid();
		recoder.players=players;
		recoder.roomid=room.roomid;
		recoder.createTime=new Date();
		return recoder;
	}
	public static RoomRecoder createTest() {
		
		RoomRecoder recoder = new RoomRecoder();
		recoder.players[0]="testuid33499";
		recoder.players[1]="100";
		recoder.players[2]="testuid33491";
		recoder.players[3]="100";
		recoder.players[4]="testuid33492";
		recoder.players[5]="100";
		recoder.createTime=new Date();
		recoder.roomid=123456;
		recoder.uid="sadfsadfasdf";
		return recoder;
	}
}
