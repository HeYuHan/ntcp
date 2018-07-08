package com.coder.ntcp.db;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map.Entry;

import com.coder.ntcp.common.RandomInt;

public class Room {
	static RandomInt roomCreater;
	static HashMap<Integer, Room> gRoomMap;
	static HashMap<String, Room> gCardRoomMap;
	int roomid;
	RoomCard roomCard;
	public String[] playUsers;
	private Room(int id,RoomCard card) {
		this.roomid=id;
		this.roomCard=card;
	}
	public int getRoomId() {
		return this.roomid;
	}
	public RoomCard getRoomCard() {
		return this.roomCard;
	}
	public boolean haveUser(String unionid)
	{
		if(playUsers == null)return false;
		for(int i=0;i<playUsers.length;i++)
		{
			if(playUsers[i].equals(unionid))return true;
		}
		return false;
	}
	static RandomInt getIdCreater() {
		if(roomCreater == null) {
			roomCreater = new RandomInt(100000, 999999, false);
			gRoomMap=new HashMap<>();
			gCardRoomMap=new HashMap<>();
		}
		return roomCreater;
	}
	public static int getRandomId() throws Exception {
		
		return getIdCreater().get();
	}
	public static Room create(RoomCard card){
		
		Room room=new Room(card.roomid,card);
		gRoomMap.put(card.roomid, room);
		gCardRoomMap.put(card.uid, room);
		return room;
	}
	public static List<Room> freeRoomsByDateBefore(Date date) {
		if(gRoomMap==null)return null ;
		Iterator<Entry<Integer, Room>> iter =  gRoomMap.entrySet().iterator();
		ArrayList<Room> frees = new ArrayList<Room>();
		while (iter.hasNext()) {
			Entry<Integer, Room> entery = iter.next();
			Room room = entery.getValue();
			RoomCard card = room.getRoomCard();
			int d = card.createTime.compareTo(date);
			if(d<=0)frees.add(room);
			
		}
		for(int i=0;i<frees.size();i++) {
			freeRoom(frees.get(i));
		}
		return frees;
	}
	public static boolean RecoverRoom(RoomCard card) {
		boolean r = getIdCreater().getByInput(card.roomid);
		if(!r)return false;
		create(card);
		return true;
	}
	public static void freeRoom(Room r) {
		Room r2=gRoomMap.get(r.getRoomId());
		if(null == r2)return;
		gRoomMap.remove(r2.getRoomId());
		gCardRoomMap.remove(r2.getRoomCard().uid);
		if(roomCreater != null)roomCreater.releaseValue(r2.getRoomId());
		if(r.playUsers!=null&&DBHelper.gDbHelper!=null)
		{
			for(int i=0;i<r.playUsers.length;i++)
			{
				DBHelper.gDbHelper.updateObjectValues(r.playUsers[i], "activeRoomId", 0, User.class);
			}
		}
	}
	public static Room getRoom(int id) {
		if(gRoomMap!=null)return gRoomMap.get(id);
		return null;
	}
	public static Room getRoom(String cardid) {
		if(gCardRoomMap!=null)return gCardRoomMap.get(cardid);
		return null;
	}
}
