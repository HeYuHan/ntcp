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
	public ArrayList<PlayerScore[]> scores;
	//public boolean freecard;
}
class ResRoomCardDetail{
	public String cardid;
	public int maxUseCount;
	public int canUseCount;
	public int payType;
	public int[] balanceRate=new int[3];
	public boolean includexi;
	public String owner;
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
		
		
		//blance
		HashMap<String, ArrayList<Integer>> totoleScore=new HashMap<>();

		for(int i=0;i<reqRoomCard.scores.size();i++) {
			PlayerScore[] scores = reqRoomCard.scores.get(i);
			for(int j=0;j<scores.length;j++) {
				PlayerScore p1 = scores[j];
				PlayerScore p2 = scores[(j+1)%scores.length];
				PlayerScore p3 = scores[(j+2)%scores.length];
				
				int s1=CaculateScore(p1,p2,card.balanceRate);
				int s2=CaculateScore(p1,p3,card.balanceRate);
				ArrayList<Integer> list=null;
				if(!totoleScore.containsKey(p1.uid)) {
					list = new ArrayList<>();
					list.add(s1+s2);
					totoleScore.put(p1.uid, list);
					
				}
				else {
					list = totoleScore.get(p1.uid);
					list.add(s1+s2);
				}
				
			}
		}
		String winnerUid="";
		int winnerScore=-1;
		if(totoleScore.size()>0)
		{
			String players[] = new String[totoleScore.size()*2];
			int index=0;
			for(String key :totoleScore.keySet()) {
				ArrayList<Integer> list=totoleScore.get(key);
				int sum=0;
				for(int k=0;k<list.size();k++) {
					sum+=list.get(k);
				}
				players[index++]=key;
				players[index++]=Integer.toString(sum);
				if(sum>winnerScore) {
					winnerScore=sum;
					winnerUid=key;
				}
			}
			RoomRecoder recoder = RoomRecoder.create(room,players);
			dbHelper.saveObject(recoder);
		}
		
		
		if(card.payType == RoomCardPayType.Host) {
			if(!userCost(card.ownerid, card.price, card.currencyType)) {
				return new ResException("ERROR_USER_NOT_FOUND");
			}
			
		}
		else if (card.payType == RoomCardPayType.AA||winnerScore <= 0) {
			float userCount=totoleScore.size();
			int cost=Math.round(card.price/userCount);
			for(String key : totoleScore.keySet()) {
				if(!userCost(key, cost, card.currencyType)) {
					return new ResException("ERROR_USER_NOT_FOUND");
				}
			}
		}
		else if (card.payType == RoomCardPayType.Winer) {
			if(!userCost(winnerUid, card.price, card.currencyType)) {
				return new ResException("ERROR_USER_NOT_FOUND");
			}
		}
		return totoleScore;
	}
	int CaculateScore(PlayerScore p1,PlayerScore p2,int[] rate) {
		int d=p1.score-p2.score;
		int scale=rate[0];
		if(p1.maizhuang && p2.maizhuang) {
			scale=rate[2];
		}
		else if(p1.maizhuang || p2.maizhuang) {
			scale=rate[1];
		}
		return d*scale;
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
