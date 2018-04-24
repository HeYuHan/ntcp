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
import com.coder.ntcp.db.CurrencyType;
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
	@NotBlank(message = "cardid is need")
	public String cardid;
	public PlayerScore[] scores;
	public boolean freecard;
}
class ResRoomCardDetail{
	public String cardid;
	public int maxUseCount;
	public int canUseCount;
	public int payType;
	public int balanceRate;
	public boolean includexi;
	public boolean isPay;
	
	public ResRoomCardDetail(Room room){
		RoomCard dbCard = room.getRoomCard();
		this.cardid=dbCard.getUid();
		this.maxUseCount=dbCard.maxUseCount;
		this.canUseCount=dbCard.canUseCount;
		this.payType=dbCard.payType.ordinal();
		this.balanceRate=dbCard.balanceRate;
		this.includexi=dbCard.includexi;
		this.isPay = dbCard.isPay;
	}
}
class ResUseRoomCard{
	public boolean ok;
	public int canUseCount;
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
	@RequestMapping(value = "/useRoomCard",method=RequestMethod.POST)
	@ResponseBody
	Object useRoomCard(@RequestBody @Valid ReqUseRoomCard reqRoomCard) {
		ResUseRoomCard resUseRoomCard = new ResUseRoomCard();
		
		if(!reqRoomCard.token.equals(config.channel_token))return new ResException("ERROR_ACCESS_TOKEN");
		Room room = Room.getRoom(reqRoomCard.roomid);
		if(room == null)return new ResException("ERROR_NOT_FIND_ROOM",Integer.toString(reqRoomCard.roomid));
		if(!room.getRoomCard().uid.equals(reqRoomCard.cardid)) return new ResException("ERROR_CHECK_ROOM_CARD");
		if(reqRoomCard.scores == null ||reqRoomCard.scores.length ==0)return new ResException("ERROR_PLAYER_SCORE");

		RoomCard card=room.getRoomCard();
		
		if(card.canUseCount>0)card.canUseCount--;
		
		RoomRecoder recoder = RoomRecoder.create(room, reqRoomCard.scores);
		dbHelper.saveObject(recoder);
		
		if(reqRoomCard.freecard ||card.canUseCount == 0) {
			Room.freeRoom(room);
			logeer.info("free room:"+room.getRoomId()+" card:"+card.getUid());
		}
		dbHelper.updateObject(card, false);
		resUseRoomCard.ok=true;
		resUseRoomCard.canUseCount=card.canUseCount;
		return resUseRoomCard;
	}
	
}
