package com.coder.ntcp.controller;

import static org.assertj.core.api.Assertions.in;
import static org.hamcrest.CoreMatchers.nullValue;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;

import org.apache.logging.log4j.message.ReusableMessage;
import org.mockito.internal.matchers.InstanceOf.VarArgAware;
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
import com.coder.ntcp.db.RoomCardPayType;
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
	public String[] scores;
	//public boolean freecard;
}
class ReqUserState
{
	@NotBlank(message = "token is need")
	public String token;
	@NotBlank(message = "unionid is need")
	public String unionid;
	public int roomid;
}
class ReqSetRoomInfo extends ReqRoomCard
{
	public String[] players;
}
class ResRoomCardDetail{
	public String cardid;
	public int maxUseCount;
	public int canUseCount;
	public int payType;
	public int[] balanceRate=new int[3];
	public boolean includexi;
	public String owner;
	public int maxScore;
	//public boolean isPay;
	
	public ResRoomCardDetail(Room room){
		RoomCard dbCard = room.getRoomCard();
		this.cardid=dbCard.getUid();
		this.maxUseCount=dbCard.maxUseCount;
		this.canUseCount=dbCard.canUseCount;
		this.payType=dbCard.payType.ordinal();
		this.balanceRate=dbCard.balanceRate;
		this.includexi=dbCard.includexi;
		this.owner=dbCard.ownerid;
		this.maxScore=dbCard.maxScore;
		//this.isPay = dbCard.isPay;
	}
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
	@RequestMapping(value = "/setRoomInfo",method=RequestMethod.POST)
	@ResponseBody
	Object setRoomInfo(@RequestBody @Valid ReqSetRoomInfo setRoomInfo)
	{
		if(!setRoomInfo.token.equals(config.channel_token))return new ResException("ERROR_ACCESS_TOKEN");
		Room room = Room.getRoom(setRoomInfo.roomid);
		if(room == null)
		{
			return new ResException("ERROR_ROOM_NOT_FOUND");
		}
		room.playUsers = setRoomInfo.players;
		for(int i=0;i<setRoomInfo.players.length;i++)
		{
			dbHelper.updateObjectValues(setRoomInfo.players[i], "activeRoomId", room.getRoomId(), User.class);
		}
		return "{}";
	}
	@RequestMapping(value = "/getUserState",method=RequestMethod.POST)
	@ResponseBody
	Object getUserState(@RequestBody @Valid ReqUserState reqUserState)
	{
		if(!reqUserState.token.equals(config.channel_token))return new ResException("ERROR_ACCESS_TOKEN");
		User dbUser=dbHelper.findObjectByUid(reqUserState.unionid, User.class);
		if(dbUser == null)
		{
			return new ResException("ERROR_NOT_FOUND");
		}
		if(dbUser.activeRoomId>0)
		{
			Room room = Room.getRoom(dbUser.activeRoomId);
			if(room !=null)
			{
				if(room.getRoomId() == reqUserState.roomid)
				{
					return "{}";
				}
				else if(room.haveUser(reqUserState.unionid))
				{
					return new ResException("ERROR_USER_STATE_INROOM",Integer.toString(dbUser.activeRoomId));
				}
			}
			dbUser.activeRoomId=0;
			dbHelper.updateObjectValues(dbUser.uid, "activeRoomId", 0, User.class);

		}
		return "{}";
	}
	@RequestMapping(value = "/useRoomCard",method=RequestMethod.POST)
	@ResponseBody
	Object useRoomCard(@RequestBody @Valid ReqUseRoomCard reqRoomCard) {
		
		if(!reqRoomCard.token.equals(config.channel_token))return new ResException("ERROR_ACCESS_TOKEN");
		Room room = Room.getRoom(reqRoomCard.roomid);
		if(room == null)return new ResException("ERROR_NOT_FIND_ROOM",Integer.toString(reqRoomCard.roomid));
		if(!room.getRoomCard().uid.equals(reqRoomCard.cardid)) return new ResException("ERROR_CHECK_ROOM_CARD");
		//if(reqRoomCard.scores == null ||reqRoomCard.scores.length ==0)return new ResException("ERROR_PLAYER_SCORE");

		RoomCard card=room.getRoomCard();
		
		Room.freeRoom(room);
		logeer.info("free room:"+room.getRoomId()+" card:"+card.getUid());
		
		
		
		card.canUseCount=0;
		dbHelper.updateObject(card, false);
		
		
		
		String winnerUid="";
		int winnerScore=-1;
		if(reqRoomCard.scores.length>0)
		{
			for(int i=0;i<reqRoomCard.scores.length;i+=3)
			{
				String uid = reqRoomCard.scores[i];
				int score = Integer.parseInt(reqRoomCard.scores[i+2]);
				if(score>winnerScore)
				{
					winnerScore=score;
					winnerUid=uid;
				}
			}
			RoomRecoder recoder = RoomRecoder.create(room,reqRoomCard.scores);
			dbHelper.saveObject(recoder);
		}
		
		
		if(card.payType == RoomCardPayType.Host) {
			if(!userCost(card.ownerid, card.price, card.currencyType)) {
				return new ResException("ERROR_USER_NOT_FOUND");
			}
			
		}
		else if (card.payType == RoomCardPayType.AA||winnerScore <= 0) {
			float userCount=reqRoomCard.scores.length/3;
			int cost=Math.round(card.price/userCount);
			for(int i=0;i<reqRoomCard.scores.length;i+=3) {
				if(!userCost(reqRoomCard.scores[i], cost, card.currencyType)) {
					return new ResException("ERROR_USER_NOT_FOUND");
				}
			}
		}
		else if (card.payType == RoomCardPayType.Winer) {
			if(!userCost(winnerUid, card.price, card.currencyType)) {
				return new ResException("ERROR_USER_NOT_FOUND");
			}
		}
		return "{\"winner\":\""+winnerUid+"\",\"score\":"+winnerScore+"}";
	}
	boolean userCost(String uid,int cost,CurrencyType currencyType) {
		User costUser=dbHelper.findObjectByUid(uid, User.class);
		if(costUser == null)return false;
		if(currencyType == CurrencyType.Diamond)costUser.diamondCount-=cost;
		else {
			 costUser.goldCount-=cost;
		}
		dbHelper.updateObject(costUser, false);
		return true;
	}
}
