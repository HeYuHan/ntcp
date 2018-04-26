package com.coder.ntcp.controller;

import javax.servlet.http.HttpServletRequest;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import com.coder.ntcp.db.AdminUser;
import com.coder.ntcp.db.DBHelper;
@Component
public class LoginInterceptor extends HandlerInterceptorAdapter{
	private final static String SESSION_KEY_PREFIX = "session:"; 
	@Autowired
	DBHelper dbHelper;
	
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {
		HttpSession session = request.getSession();
		String path = request.getServletPath();
		String method=request.getMethod();
		if(path.equals("/admin/auth")&&method.equals("POST"))
		{
			String username=request.getParameter("username");
			String password=request.getParameter("password");
			AdminUser user = dbHelper.findObjectByUid(username, AdminUser.class);
			if(user == null) {
				response.sendRedirect("/admin/login");
				return false;
			}
			else
			{
				session.setAttribute(SESSION_KEY_PREFIX, username+":"+user.level);
				response.sendRedirect("/admin/");
				return false;
			}
		}
		
		if(session.getAttribute(SESSION_KEY_PREFIX) != null) {
			return true;
		}
		
		response.sendRedirect("/admin/login");
		
		return false;
	}
	
}
