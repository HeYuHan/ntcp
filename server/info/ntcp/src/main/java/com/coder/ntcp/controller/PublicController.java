package com.coder.ntcp.controller;

import static org.hamcrest.CoreMatchers.nullValue;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;

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
import com.coder.ntcp.db.User;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
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
	@NotBlank(message = "openid is null")
	public String code;
}
class ResUser{
	public String openid;
	public int goldCount;
	public boolean isProxy;
	public int diamondCount;
	public ResUser() {}
	public ResUser(User dbUser){
		this.openid=dbUser.uid;
		this.goldCount=dbUser.glodCount;
		this.diamondCount=dbUser.diamondCount;
		this.isProxy=dbUser.isProxy;
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
	ResUser getUserInfo(@RequestBody @Valid ReqUser reqUser) {

		WeiXinUser weiXinUser=getWeiXinUser(reqUser);
		if(weiXinUser.isError())return new ResUser();
		User dbUser=dbHelper.findObjectByUid(weiXinUser.unionid, User.class);
		if(dbUser != null)return new ResUser(dbUser);
		dbUser = new User();
		dbUser.openid=weiXinUser.openid;
		dbUser.uid=weiXinUser.unionid;
		dbUser.diamondCount=1000;
		dbUser.glodCount=1000;
		dbHelper.saveObject(dbUser);
		return new ResUser(dbUser);
		
	}
	WeiXinUser getWeiXinUser(ReqUser reqUser) {
		MultiValueMap<String, String> params= new LinkedMultiValueMap<String, String>();
		params.add("appid", config.appid);
		params.add("secret", config.appkey);
		params.add("grant_type","authorization_code");
		params.add("code",reqUser.code);
		String userInfo=Tools.httpGet(config.tokenurl, params);
		if(userInfo != null) {
			ObjectMapper mapper = new ObjectMapper();
			try {
				WeiXinUser weiXinUser=mapper.readValue(userInfo, WeiXinUser.class);
				return weiXinUser;
			} catch (Exception e) {
				return null;
			} 
		}
		return null;
	}
	
}
