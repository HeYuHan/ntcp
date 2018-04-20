package com.coder.ntcp.controller;

import static org.assertj.core.api.Assertions.in;
import static org.hamcrest.CoreMatchers.nullValue;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.ExtendedServletRequestDataBinder;

import com.coder.ntcp.GConfig;
import com.coder.ntcp.db.DBHelper;
import com.coder.ntcp.db.Room;
import com.coder.ntcp.db.RoomCard;
import com.coder.ntcp.db.RoomPlayer;
import com.coder.ntcp.db.RoomRecoder;
import com.coder.ntcp.db.User;

class ReqRoomCard{
	
	public int roomid;
	@NotBlank(message = "token is need")
	public String token;
	
}
class ReqUseRoomCard extends ReqRoomCard{
	public String[] players;
	@NotBlank(message = "cardid is need")
	public String cardid;
	public int[] scores;
	public boolean freecard;
}
class ResRoomCardDetail{
	public String cardid;
	public int maxUseCount;
	public int canUseCount;
	public int payType;
	public int blanceRate;
	public boolean includexi;
	public boolean isPay;
	public RoomPlayer[] players;
	
	public ResRoomCardDetail(Room room){
		RoomCard dbCard = room.getRoomCard();
		this.cardid=dbCard.getUid();
		this.maxUseCount=dbCard.maxUseCount;
		this.canUseCount=dbCard.canUseCount;
		this.payType=dbCard.payType;
		this.blanceRate=dbCard.blanceRate;
		this.includexi=dbCard.includexi;
		this.isPay = dbCard.isPay;
		this.players = new RoomPlayer[room.roomPlayers.size()];
		Iterator<Entry<String, RoomPlayer>> iter =  room.roomPlayers.entrySet().iterator();
		int i=0;
		while (iter.hasNext()) {
			Entry<String, RoomPlayer> entery = iter.next();
			RoomPlayer p = entery.getValue();
			if(p!= null)this.players[i++]=p;
			
		}
	}
}
class ResUseRoomCard{
	public boolean ok;
	public int canUseCount;
	public RoomPlayer[] players;
}

class ReqEnterRoom extends ReqRoomCard{
	@NotBlank(message = "uid is need")
	public String uid;
	@NotBlank(message = "cardid is need")
	public String cardid;
}
class ResEnterRoom{
	public String error;
}

class ReqPayRoomCard extends ReqRoomCard{
	@NotBlank(message = "cardid is need")
	public String cardid;
	public String[] players;
}
class ResPayRoomCard{
	public String error;
}

@RestController
@Component
@RequestMapping("/private")
public class InnerController {
	private static final Logger logeer = LoggerFactory.getLogger(InnerController.class);
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
		return new ResRoomCardDetail(room);
	}
	
	@RequestMapping(value = "/enterRoom",method=RequestMethod.POST)
	@ResponseBody
	Object enterRoom(@RequestBody @Valid ReqEnterRoom reqEnterRoom) {
		if(!reqEnterRoom.token.equals(config.channel_token))return new ResException("ERROR_ACCESS_TOKEN");
		Room room = Room.getRoom(reqEnterRoom.roomid);
		if(room == null)return new ResException("ERROR_NOT_FIND_ROOM",Integer.toString(reqEnterRoom.roomid));
		if(!room.getRoomCard().uid.equals(reqEnterRoom.cardid)) return new ResException("ERROR_CHECK_ROOM_CARD");
		//if(!room.getRoomCard().uid.equals(reqRoomCard.cardid)) return new ResException("ERROR_CHECK_ROOM_CARD");
		User dbUser = dbHelper.findObjectByUid(reqEnterRoom.uid, User.class);
		if(dbUser == null) return new ResException("ERROR_USER_NOT_FOUND",reqEnterRoom.uid);
		RoomCard card = room.getRoomCard();
		if(!card.isPay) {
			
			
			if(card.payType == RoomCard.PAY_AA) {
				float cost = card.getCost();
				int d = (int)Math.ceil(cost/3);
				if(dbUser.diamondCount<d) {
					return new ResException("ERROR_DIAMOND_NOT_FULL");
				}
			}
			else if(card.payType == RoomCard.PAY_WINER && dbUser.diamondCount < card.getCost()) {
				return new ResException("ERROR_DIAMOND_NOT_FULL");
			}
		}
		room.createPlayer(dbUser.getUid());
		return new ResEnterRoom();
	}
	@RequestMapping(value = "/payRoomCard",method=RequestMethod.POST)
	@ResponseBody
	Object payRoomCard(@RequestBody @Valid ReqPayRoomCard reqPayRoomCard) {
		if(!reqPayRoomCard.token.equals(config.channel_token))return new ResException("ERROR_ACCESS_TOKEN");
		Room room = Room.getRoom(reqPayRoomCard.roomid);
		if(room == null)return new ResException("ERROR_NOT_FIND_ROOM",Integer.toString(reqPayRoomCard.roomid));
		if(!room.getRoomCard().uid.equals(reqPayRoomCard.cardid)) return new ResException("ERROR_CHECK_ROOM_CARD");
		if(reqPayRoomCard.players == null || reqPayRoomCard.players.length == 0)return new ResException("ERROR_NO_PLAYER_INROOM");
		RoomCard card=room.getRoomCard();
		if(!card.isPay) {
			if(card.payType == RoomCard.PAY_HOST) {
				User host = dbHelper.findObjectByUid(card.ownerid, User.class);
			}
		}
		return null;
	}
	
	@RequestMapping(value = "/useRoomCard",method=RequestMethod.POST)
	@ResponseBody
	Object useRoomCard(@RequestBody @Valid ReqUseRoomCard reqRoomCard) {
		ResUseRoomCard resUseRoomCard = new ResUseRoomCard();
		if(!reqRoomCard.token.equals(config.channel_token))return new ResException("ERROR_ACCESS_TOKEN");
		Room room = Room.getRoom(reqRoomCard.roomid);
		if(room == null)return new ResException("ERROR_NOT_FIND_ROOM",Integer.toString(reqRoomCard.roomid));
		if(!room.getRoomCard().uid.equals(reqRoomCard.cardid)) return new ResException("ERROR_CHECK_ROOM_CARD");

		if(reqRoomCard.players == null)return new ResException("ERROR_NO_PLAYER_INROOM");
		if(reqRoomCard.scores == null)return new ResException("ERROR_PLAYER_SCORE");
		if(reqRoomCard.players.length==0 ||reqRoomCard.players.length != reqRoomCard.scores.length)return new ResException("ERROR_PLAYERS_SIZE");

		RoomCard card=room.getRoomCard();
		
		for(int i=0;i<reqRoomCard.players.length;i++) {
			RoomPlayer player = room.createPlayer(reqRoomCard.players[i]);
			player.scores[card.maxUseCount - card.canUseCount]=reqRoomCard.scores[i];
		}
		
		
		if(card.canUseCount>0)card.canUseCount--;
		
		RoomRecoder recoder = RoomRecoder.create(room, reqRoomCard.players);
		dbHelper.saveObject(recoder);
		
		if(reqRoomCard.freecard ||card.canUseCount == 0) {
			Room.freeRoom(room);
		}
		dbHelper.updateObject(card, false);
		resUseRoomCard.ok=true;
		resUseRoomCard.canUseCount=card.canUseCount;
		resUseRoomCard.players=new RoomPlayer[room.roomPlayers.size()];
		Iterator<Entry<String, RoomPlayer>> iter =  room.roomPlayers.entrySet().iterator();
		int i=0;
		while (iter.hasNext()) {
			Entry<String, RoomPlayer> entery = iter.next();
			RoomPlayer p = entery.getValue();
			if(p!= null)resUseRoomCard.players[i++]=p;
			
		}
		return resUseRoomCard;
	}
	
}
