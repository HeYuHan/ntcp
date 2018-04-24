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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.CrossOrigin;
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
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.java.Log;
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
class WeiXinUserInfo{
	public String nickname;
	public String headimgurl;
	public String errcode;
	public String errmsg;
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
	//public String token;
	public String headimgurl;
	public int goldCount;
	public boolean isProxy;
	public int diamondCount;
	public String nick;
	public ResUser() {}
	public ResUser(User dbUser){
		this.uid=dbUser.uid;
		this.openid=dbUser.openid;
		this.goldCount=dbUser.goldCount;
		this.diamondCount=dbUser.diamondCount;
		this.isProxy=dbUser.isProxy;
		this.nick=dbUser.nick;
		//this.token=dbUser.token;
		this.headimgurl= dbUser.headimgurl;
	}
}
class ResRoomCard{
	public int roomid;
	public boolean isnew;
	public int canUseCount;
	public int goldCount;
	public int diamondCount;
	public String error;
	public ResRoomCard() {}
	public ResRoomCard(Room room,User user) {
		RoomCard card=room.getRoomCard();
		isnew=card.canUseCount==card.maxUseCount;
		roomid=room.getRoomId();
		canUseCount=card.canUseCount;
		diamondCount=user.diamondCount;
		goldCount=user.goldCount;
		
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



@Controller
@RestController
@Component
@RequestMapping("/public")
public class PublicController {
	private static final Logger logeer = LoggerFactory.getLogger(PublicController.class);
	
	@Autowired
	GConfig config;
	
	@Autowired
	DBHelper dbHelper;
	
	@RequestMapping(value="/getUserInfo",method=RequestMethod.POST)
	@ResponseBody
	@CrossOrigin
	Object getUserInfo(@RequestBody @Valid ReqUser reqUser) {
		if(reqUser.checkCode) {
			WeiXinUser weiXinUser=getWeiXinUser(reqUser);
			
			if(weiXinUser==null) {
				return new ResException("ERROR_GET_WEIXIN_TOKEN");
			}
			if(weiXinUser.isError())return new ResException("ERROR_GET_WEIXIN_TOKEN",weiXinUser.errmsg);
			User dbUser=dbHelper.findObjectByUid(weiXinUser.unionid, User.class);
			if(dbUser != null)
			{
				dbUser.token=weiXinUser.access_token;
				dbHelper.updateObject(dbUser, false);
				return new ResUser(dbUser);
			}
			
			WeiXinUserInfo weiXinUserInfo =getWeiXinUserInfo(weiXinUser);
			if(weiXinUserInfo == null)return new ResException("ERROR_GET_WEIXIN_INFO");
			
			if(weiXinUserInfo.isError())return new ResException("ERROR_GET_WEIXIN_INFO",weiXinUserInfo.errmsg);
			
			
			dbUser = new User();
			dbUser.openid=weiXinUser.openid;
			dbUser.uid=weiXinUser.unionid;
			dbUser.token=weiXinUser.access_token;
			dbUser.nick=weiXinUserInfo.nickname;
			dbUser.headimgurl=weiXinUserInfo.headimgurl;
			dbUser.diamondCount=1000;
			dbUser.goldCount=1000;
			dbHelper.saveObject(dbUser);
			return new ResUser(dbUser);
		}
		else {
			User dbUser=dbHelper.findObjectByUid(reqUser.uid, User.class);
			if(dbUser != null)return new ResUser(dbUser);
		}
		return new ResException("ERROR_USER_NOT_FOUND");
		
	}
	@RequestMapping(value="/getRoomCard",method=RequestMethod.POST)
	@ResponseBody
	@CrossOrigin
	Object getRoomCard(@RequestBody @Valid ReqRoomCardOption reqRoomCardOption) {
		User user = dbHelper.findObjectByUid(reqRoomCardOption.uid, User.class);
		if(user == null) {
			ResRoomCard resRoomCard=new ResRoomCard();
			resRoomCard.error="ERROR_USER_NOT_FOUND";
			return resRoomCard;
		}
//		RoomCard dbCard=dbHelper.findUnuseCard(reqRoomCardOption.uid,reqRoomCardOption);
//		if(reqRoomCardOption.forceNew && dbCard!=null) {
//			dbCard.canUseCount=0;
//			dbHelper.updateObject(dbCard, false);
//			Room room = Room.getRoom(dbCard.getUid());
//			if(room != null)Room.freeRoom(room);
//			dbCard=null;
//		}
//		if(dbCard != null) {
//			
//			Room room=Room.getRoom(dbCard.uid);
//			if(room == null) {
//				try {
//					room = Room.create(dbCard);
//				} catch (Exception e) {
//					return new ResException("ERROR_CREATE_ROOM",e.getMessage());
//				}
//			}
//			return new ResRoomCard(room, user);
//		}
//		else {
//			
//			try {
//				RoomCard card = RoomCard.create(user, reqRoomCardOption,dbHelper);
//				return new ResRoomCard(Room.create(card),user);
//			} catch (Exception e) {
//				return new ResException("ERROR_CREATE_ROOM",e.getMessage());
//			}
//			
//			
//		}
		try {
			RoomCard card = RoomCard.create(user, reqRoomCardOption,dbHelper);
			return new ResRoomCard(Room.create(card),user);
		} catch (Exception e) {
			logeer.error(e.getLocalizedMessage());
			return new ResException("ERROR_CREATE_ROOM",e.getMessage());
		}
	}
	
	@RequestMapping(value="/getRoomRecoder",method=RequestMethod.POST)
	@ResponseBody
	@CrossOrigin
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
			mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			WeiXinUser weiXinUser=mapper.readValue(userInfo, WeiXinUser.class);
			return weiXinUser;
		} catch (Exception e) {
			logeer.error(e.getMessage());
			return null;
		}
	}
	WeiXinUserInfo getWeiXinUserInfo(WeiXinUser user) {
		
		try {
			String userInfo=Tools.httpGet(config.userurl+"?openid="+user.openid+"&access_token="+user.access_token);
			ObjectMapper mapper = new ObjectMapper();
			mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			WeiXinUserInfo weiXinUser=mapper.readValue(userInfo, WeiXinUserInfo.class);
			return weiXinUser;
		} catch (Exception e) {
			logeer.error(e.getMessage());
			return null;
		}
	}
	
}
