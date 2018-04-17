package com.coder.ntcp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.coder.ntcp.db.DBHelper;
import com.coder.ntcp.db.User;

@RestController
@Component
@RequestMapping("/public")
public class PublicController {
	@Autowired
	DBHelper dbHelper;
	
	@RequestMapping(value="/get_user_info",method=RequestMethod.GET)
	User getUserInfo(@RequestParam("data") String data) {
		User user =new User();
		user.setUid(data);
		return user;
	}
}
