package com.coder.ntcp.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.coder.ntcp.db.DBHelper;

@Controller
@RequestMapping("/admin")
public class AdminControl {
	
	
	@RequestMapping("/test")
	String test() {
		return "/test/index.html";
	}
	
}
