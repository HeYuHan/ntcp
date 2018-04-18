package com.coder.ntcp.db;

import java.util.HashMap;

import com.coder.ntcp.common.RandomInt;

public class Room {
	static RandomInt roomCreater;
	static HashMap<Integer, Room> gRoomMap;
	int roomid;
	private Room(int id) {
		this.roomid=id;
	}
	public int getRoomId() {
		return this.roomid;
	}
	public static Room create() {
		if(roomCreater == null) {
			roomCreater = new RandomInt(100000, 999999, false);
			gRoomMap=new HashMap<>();
		}
		try {
			int id=roomCreater.get();
			Room room=new Room(id);
			gRoomMap.put(id, room);
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
		if(roomCreater != null)roomCreater.releaseValue(r2.getRoomId());
	}
	public static Room getRoom(int id) {
		if(gRoomMap!=null)return gRoomMap.get(id);
		return null;
	}
}
