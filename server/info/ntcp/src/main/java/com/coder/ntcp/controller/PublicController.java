package com.coder.ntcp.controller;

import static org.assertj.core.api.Assertions.in;
import static org.hamcrest.CoreMatchers.nullValue;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;

import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.coder.ntcp.GConfig;
import com.coder.ntcp.common.Tools;
import com.coder.ntcp.db.DBHelper;
import com.coder.ntcp.db.Room;
import com.coder.ntcp.db.RoomCard;
import com.coder.ntcp.db.RoomRecoder;
import com.coder.ntcp.db.User;
import com.fasterxml.jackson.databind.ObjectMapper;
class WeiXinUser{
	public String errcode;
	public String errmsg;
	public String access_token;
	public String expires_in;
	public String refresh_token;
	public String openid;
	public String scope;
	public String unionid;
	public boolean isError() {
		return errcode != null;
	}
}

class ReqUser{
	public boolean checkCode;
	@NotBlank(message = "code is need")
	public String code;
	@NotBlank(message = "uid is need")
	public String uid;
}
class ResUser{
	public String openid;
	public String uid;
	public String token;
	public int goldCount;
	public boolean isProxy;
	public int diamondCount;
	public ResUser() {}
	public ResUser(User dbUser){
		this.uid=dbUser.uid;
		this.openid=dbUser.openid;
		this.goldCount=dbUser.glodCount;
		this.diamondCount=dbUser.diamondCount;
		this.isProxy=dbUser.isProxy;
		this.token=dbUser.token;
	}
}
class ResRoomCard{
	public int roomid;
	public String cardid;
	public boolean isnew;
	public String error;
	public ResRoomCard() {}
	public ResRoomCard(Room room) {
		RoomCard card=room.getRoomCard();
		isnew=card.usedCount==0;
		cardid=card.uid;
		roomid=room.getRoomId();
	}
}

class ReqRoomRecoder{
	public int dayCount;
	@NotBlank(message = "uid is need")
	public String uid;
}
class ResRoomRecoder{
	public String cardid;
	public int roomid;
	public int useIndex;
	public ResRoomRecoder(RoomRecoder dbRecoder) {
		this.cardid=dbRecoder.cardid;
		this.roomid=dbRecoder.roomid;
		this.useIndex=dbRecoder.useIndex;
	}
}



@RestController
@Component
@RequestMapping("/public")
public class PublicController {
	
	
	@Autowired
	GConfig config;
	
	@Autowired
	DBHelper dbHelper;
	
	@RequestMapping(value="/getUserInfo",method=RequestMethod.POST)
	@ResponseBody
	Object getUserInfo(@RequestBody @Valid ReqUser reqUser) {
		if(reqUser.checkCode) {
			WeiXinUser weiXinUser=getWeiXinUser(reqUser);
			if(weiXinUser==null) {
				return new ResException("ERROR_GET_WEIXIN_INFO");
			}
			if(weiXinUser.isError())return new ResException("ERROR_GET_WEIXIN_INFO",weiXinUser.errmsg);
			User dbUser=dbHelper.findObjectByUid(weiXinUser.unionid, User.class);
			if(dbUser != null)return new ResUser(dbUser);
			dbUser = new User();
			dbUser.openid=weiXinUser.openid;
			dbUser.uid=weiXinUser.unionid;
			dbUser.diamondCount=1000;
			dbUser.glodCount=1000;
			dbUser.token=weiXinUser.access_token;
			dbHelper.saveObject(dbUser);
			return new ResUser(dbUser);
		}
		else {
			User dbUser=dbHelper.findObjectByUid(reqUser.uid, User.class);
			if(dbUser != null)return new ResUser(dbUser);
		}
		return new ResUser();
		
	}
	@RequestMapping(value="/getRoomCard",method=RequestMethod.POST)
	@ResponseBody
	Object getRoomCard(@RequestBody @Valid ReqRoomCardOption reqRoomCardOption) {
		RoomCard dbCard=dbHelper.findUnuseCard(reqRoomCardOption.uid);
		if(dbCard != null) {
			Room room=Room.getRoom(dbCard.uid);
			if(room == null) {
				room = Room.create(dbCard);
			}
			return new ResRoomCard(room);
		}else {
			User user = dbHelper.findObjectByUid(reqRoomCardOption.uid, User.class);
			if(user == null) {
				ResRoomCard resRoomCard=new ResRoomCard();
				resRoomCard.error="USER_NOT_FOUND";
				return resRoomCard;
			}
			try {
				RoomCard card = RoomCard.create(user, reqRoomCardOption);
				dbHelper.saveObject(card);
				dbHelper.updateObject(user, false);
				return new ResRoomCard(Room.create(card));
			} catch (Exception e) {
				return new ResException(e.getMessage());
			}
			
			
		}
	}
	
	@RequestMapping(value="/getRoomRecoder",method=RequestMethod.POST)
	@ResponseBody
	ArrayList<ResRoomRecoder> getRoomRecoder(@RequestBody @Valid ReqRoomRecoder reqRoomRecoder) {
		ArrayList<ResRoomRecoder> list = new ArrayList<>();
		List<RoomRecoder> findlist = dbHelper.findRoomRecoderByDay(reqRoomRecoder.uid, reqRoomRecoder.dayCount);
		for(RoomRecoder item : findlist) {
			list.add(new ResRoomRecoder(item));
		}
		return list;
	}
	
	WeiXinUser getWeiXinUser(ReqUser reqUser) {
		
		try {
			String userInfo=Tools.httpGet(config.tokenurl+"?appid="+config.appid+"&secret="+config.appkey+"&code="+reqUser.code+"&grant_type=authorization_code");
			ObjectMapper mapper = new ObjectMapper();
			WeiXinUser weiXinUser=mapper.readValue(userInfo, WeiXinUser.class);
			return weiXinUser;
		} catch (Exception e) {
			return null;
		}
	}
	
}
