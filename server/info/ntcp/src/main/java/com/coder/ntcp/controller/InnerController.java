package com.coder.ntcp.controller;

import static org.hamcrest.CoreMatchers.nullValue;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.coder.ntcp.GConfig;
import com.coder.ntcp.db.DBHelper;
import com.coder.ntcp.db.Room;
import com.coder.ntcp.db.RoomCard;
import com.coder.ntcp.db.RoomRecoder;
import com.coder.ntcp.db.User;

class ReqRoomCard{
	
	public int roomid;
	@NotBlank(message = "token is need")
	public String token;
	
}
class ReqUseRoomCard extends ReqRoomCard{
	@NotBlank(message = "players is need")
	public String[] players;
	@NotBlank(message = "cardid is need")
	public String cardid;
}
class ResRoomCardDetail{
	public String cardid;
	public int maxUseCount;
	public int usedCount;
	public int payType;
	public int blanceRate;
	public boolean includexi;
	
	public ResRoomCardDetail(RoomCard dbCard){
		this.cardid=dbCard.getUid();
		this.maxUseCount=dbCard.maxUseCount;
		this.usedCount=dbCard.usedCount;
		this.payType=dbCard.payType;
		this.blanceRate=dbCard.blanceRate;
		this.includexi=dbCard.includexi;
	}
}
class ResUseRoomCard{
	public boolean ok;
	public int canUseCount;
}

@RestController
@Component
@RequestMapping("/private")
public class InnerController {
	@Autowired
	GConfig config;
	
	@Autowired
	DBHelper dbHelper;
	
	@RequestMapping(value = "/getRoomCard",method=RequestMethod.POST)
	@ResponseBody
	Object getRoomCard(@RequestBody @Valid ReqRoomCard reqRoomCard) {
		if(!reqRoomCard.token.equals(config.channel_token))return new ResException("ERROR_ACCESS_TOKEN");
		Room room = Room.getRoom(reqRoomCard.roomid);
		if(room == null)return new ResException("ERROR_NOT_FIND_ROOM",Integer.toString(reqRoomCard.roomid));
		//if(!room.getRoomCard().uid.equals(reqRoomCard.cardid)) return new ResException("ERROR_CHECK_ROOM_CARD");
		return new ResRoomCardDetail(room.getRoomCard());
	}
	
	@RequestMapping(value = "/useRoomCard",method=RequestMethod.POST)
	@ResponseBody
	Object useRoomCard(@RequestBody @Valid ReqUseRoomCard reqRoomCard) {
		ResUseRoomCard resUseRoomCard = new ResUseRoomCard();
		if(!reqRoomCard.token.equals(config.channel_token))return new ResException("ERROR_ACCESS_TOKEN");
		Room room = Room.getRoom(reqRoomCard.roomid);
		if(room == null)return new ResException("ERROR_NOT_FIND_ROOM",Integer.toString(reqRoomCard.roomid));
		if(!room.getRoomCard().uid.equals(reqRoomCard.cardid)) return new ResException("ERROR_CHECK_ROOM_CARD");
		if(reqRoomCard.players == null ||reqRoomCard.players.length == 0)return new ResException("ERROR_NO_PLAYER_INROOM");
		
//		User[] users = new User[3];
//		for(int i=0;i<reqRoomCard.players.length;i++) {
//			users[i]=dbHelper.findObjectByUid(reqRoomCard.players[i], User.class);
//			if(users[i] == null) {
//				return new ResException("ERROR_USER_NOT_FOUND");
//			}
//		}
		RoomCard card=room.getRoomCard();
		if(card.usedCount<card.maxUseCount)card.usedCount++;
		
		RoomRecoder recoder = RoomRecoder.create(room, reqRoomCard.players);
		dbHelper.saveObject(recoder);
		
		if(card.usedCount == card.maxUseCount) {
			Room.freeRoom(room);
		}
		dbHelper.updateObject(card, false);
		resUseRoomCard.ok=true;
		resUseRoomCard.canUseCount=card.maxUseCount-card.usedCount;
		return resUseRoomCard;
	}
	
}
