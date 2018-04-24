package com.coder.ntcp.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.coder.ntcp.db.DBHelper;
import com.coder.ntcp.db.RoomRecoder;
import com.coder.ntcp.db.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
@RestController
@Component
@RequestMapping("/test")
public class TestControl {
	
	@Autowired
	DBHelper dbHelper;
	
	@RequestMapping("/createRandomRecoder")
	@CrossOrigin
	String createRandomRecoder() throws JsonProcessingException {
		RoomRecoder recoder = RoomRecoder.createTest();
		dbHelper.saveObject(recoder);
		ObjectMapper mapper = new ObjectMapper();
		Map<String, Object> tipMap = new HashMap<String, Object>();
		tipMap.put("cardid", recoder.cardid);
		tipMap.put("roomid", recoder.roomid);
		tipMap.put("players", recoder.players);
		tipMap.put("useIndex", recoder.useIndex);
		return mapper.writeValueAsString(tipMap);
	}
	@RequestMapping("/createRandomUser")
	@CrossOrigin
	String createRandomUser() throws JsonProcessingException {
		User dbUser = new User();
		dbUser.uid="testuid"+Integer.toString((int)(Math.random()*100000));;
		dbUser.openid="testopenid"+Integer.toString((int)(Math.random()*100000));;
		
		dbUser.diamondCount=1000;
		dbUser.goldCount=1000;
		dbUser.token="testtoken"+Integer.toString((int)(Math.random()*100000));;
		dbHelper.saveObject(dbUser);
		ObjectMapper mapper = new ObjectMapper();
		Map<String, Object> tipMap = new HashMap<String, Object>();
		tipMap.put("uid", dbUser.uid);
		tipMap.put("openid", dbUser.openid);
		tipMap.put("diamondCount", dbUser.diamondCount);
		tipMap.put("glodCount", dbUser.goldCount);
		tipMap.put("token", dbUser.token);
		return mapper.writeValueAsString(tipMap);
	}
}
