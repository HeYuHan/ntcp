package com.coder.ntcp.controller;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class AdminControl {
	
	
	@RequestMapping("/")
	String test() {
		return "/test/index";
	}
	@RequestMapping("/login")
	String login() {
		return "/html/login";
	}
}
