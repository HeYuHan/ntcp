package com.coder.ntcp.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;
@Component
public class LoginInterceptor extends HandlerInterceptorAdapter{
	private final static String SESSION_KEY_PREFIX = "session:"; 
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {
		HttpSession session = request.getSession();
		if(session.getAttribute(SESSION_KEY_PREFIX) != null) {
			return true;
		}
		
		response.sendRedirect("/admin/login");
		
		return false;
	}
	
}
