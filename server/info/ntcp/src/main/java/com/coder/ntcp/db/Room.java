package com.coder.ntcp.db;

import static org.hamcrest.CoreMatchers.nullValue;

import java.util.HashMap;

import com.coder.ntcp.common.RandomInt;

public class Room {
	static RandomInt roomCreater;
	static HashMap<Integer, Room> gRoomMap;
	static HashMap<String, Room> gCardRoomMap;
	int roomid;
	RoomCard roomCard;
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
	public static Room create(RoomCard card) {
		if(roomCreater == null) {
			roomCreater = new RandomInt(100000, 999999, false);
			gRoomMap=new HashMap<>();
			gCardRoomMap=new HashMap<>();
		}
		try {
			int id=roomCreater.get();
			Room room=new Room(id,card);
			gRoomMap.put(id, room);
			gCardRoomMap.put(card.uid, room);
			return room;
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}
	}
	public static void freeRoom(Room r) {
		Room r2=gRoomMap.get(r.getRoomId());
		if(null == r2)return;
		gRoomMap.remove(r2.getRoomId());
		gCardRoomMap.remove(r2.getRoomCard().uid);
		if(roomCreater != null)roomCreater.releaseValue(r2.getRoomId());
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
