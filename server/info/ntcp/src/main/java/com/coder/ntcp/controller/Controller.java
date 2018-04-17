package com.coder.ntcp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.coder.ntcp.db.DBHelper;
import com.coder.ntcp.db.User;
@RestController
@Component
public class Controller {
	@Autowired
	DBHelper dbHelper;
	@RequestMapping("/hello")
	public String Hello()
	{
		
		return "Hello World";
	}
}
