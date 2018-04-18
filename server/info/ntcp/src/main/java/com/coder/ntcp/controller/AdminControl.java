package com.coder.ntcp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class AdminControl {
	@RequestMapping("/test")
	String test() {
		return "/test/index.html";
	}
}
