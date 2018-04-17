package com.coder.ntcp.controller;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestBody;
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
	class ResUser{
		public String uid;
	}
	class ReqUser{
		@NotBlank(message = "openid is null")
		public String openid;
	}
	@Autowired
	DBHelper dbHelper;
	
	@RequestMapping(value="/getUserInfo")
	@ResponseBody
	ResUser getUserInfo(@RequestBody @Valid ReqUser reqUser) {
		ResUser user =new ResUser();
		user.uid=reqUser.openid;
		return user;
	}
}
