package com.coder.ntcp.controller;



import static org.hamcrest.CoreMatchers.nullValue;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.coder.ntcp.db.AdminUser;
import com.coder.ntcp.db.DBHelper;
import com.coder.ntcp.db.DBPageResult;
import com.coder.ntcp.db.User;

class EditUser
{
	@NotBlank(message = "uid is need")
	public String uid;
	public int goldCount;
	public int diamondCount;
	public boolean isProxy;
	public String nick;
	public EditUser() {}
	public EditUser(User user)
	{
		this.uid=user.uid;
		this.goldCount=user.goldCount;
		this.diamondCount=user.diamondCount;
		this.isProxy=user.isProxy;
		this.nick=user.nick;
	}
}
class ReqPageData
{
	public int offset;
	public int limit;
}
@Controller
@RequestMapping("/admin")
public class AdminControl {
	static final int ROOT_LEVEL=1<<5;
	static final int PROXY_LEVEL=1<<4;
	static final int SCAN_LEVEL=1<<3;
	private static final Logger logeer = LoggerFactory.getLogger(AdminControl.class);
	@Autowired
	DBHelper dbHelper;
	
	@RequestMapping("/")
	String index(ModelMap map,HttpServletRequest request) {
		AdminUser user=(AdminUser) request.getSession().getAttribute(LoginInterceptor.SESSION_KEY_PREFIX);
		map.put("account", user.uid);
		map.put("level", user.level);
		map.put("nick", user.nick);
		return "/admin";
	}
	@RequestMapping("/login")
	String login() {
		return "/html/login.html";
	}
	@RequestMapping("/test")
	String test(HttpServletRequest request) {
		AdminUser admin=(AdminUser) request.getSession().getAttribute(LoginInterceptor.SESSION_KEY_PREFIX);
		if((1<<admin.level&ROOT_LEVEL)==0)return "redirect:/admin/login.html";
		return "/test/index.html";
	}
	@RequestMapping(value = "/getUsers",method=RequestMethod.POST)
	@ResponseBody
	Object getUsers(@RequestBody @Valid ReqPageData reqPageData)
	{
		if(reqPageData.offset<0||reqPageData.limit<=0)return null;
		ArrayList<EditUser> users=new ArrayList<EditUser>();
		DBPageResult<User> queryRet=new DBPageResult<User>(reqPageData.offset, reqPageData.limit);
		dbHelper.findUsers(queryRet);
		for(User u : queryRet.result) {
			users.add(new EditUser(u));
		}
		HashMap<String, Object> ret=new HashMap<>();
		ret.put("total", queryRet.totle);
		ret.put("page",(int)Math.ceil(queryRet.offest/queryRet.limit+0.1));
		ret.put("rows", users);
		return ret;
	}
	@RequestMapping(value = "/getProxys",method=RequestMethod.POST)
	@ResponseBody
	Object getProxys(int offset,int limit)
	{
		if(offset<0||limit<=0)return null;
		ArrayList<EditUser> users=new ArrayList<EditUser>();
		DBPageResult<User> queryRet=new DBPageResult<User>(offset, limit);
		dbHelper.findProxys(queryRet);
		for(User u : queryRet.result) {
			users.add(new EditUser(u));
		}
		return users;
	}
	@RequestMapping(value = "/addGoldAndDiamond",method=RequestMethod.POST)
	@ResponseBody
	Object addGoldAndDiamond(String uid,int gold,int diamond,HttpServletRequest request)
	{
		AdminUser admin=(AdminUser) request.getSession().getAttribute(LoginInterceptor.SESSION_KEY_PREFIX);
		if((1<<admin.level&PROXY_LEVEL)==0)return new ResException("ERROR_LOW_PERMISSION");
		User dbUser=dbHelper.findObjectByUid(uid, User.class);
		if(dbUser == null)return new ResException("ERROR_USER_NOT_FOUND");
		User adminUser=dbHelper.findObjectByUid(admin.uid, User.class);
		if(adminUser == null)return new ResException("ERROR_PROXY_NOT_FOUND");
		if((1<<admin.level&ROOT_LEVEL)==0)
		{
			if(adminUser.goldCount<gold)return new ResException("ERROR_PROXY_GOLD");
			if(adminUser.diamondCount<diamond)return new ResException("ERROR_PROXY_DIAMOND");
			adminUser.diamondCount-=diamond;
			adminUser.goldCount-=gold;
			dbHelper.updateObject(adminUser, false);
		}
		dbUser.diamondCount+=diamond;
		dbUser.goldCount+=gold;
		dbHelper.updateObject(dbUser, false);
		logeer.info("PROXY_RECARGE=>proxy:"+admin.uid+" target:"+dbUser.uid+" gold:"+gold+" diamond:"+diamond);
		return new ResException(null);
	}
	@RequestMapping(value = "/setLevel",method=RequestMethod.POST)
	@ResponseBody
	Object setLevel(String uid,int level,HttpServletRequest request)
	{

		AdminUser admin=(AdminUser) request.getSession().getAttribute(LoginInterceptor.SESSION_KEY_PREFIX);
		if((1<<admin.level&ROOT_LEVEL)==0||level>4)return new ResException("ERROR_LOW_PERMISSION");
		AdminUser new_admin=dbHelper.findObjectByUid(uid, AdminUser.class);
		if(new_admin!=null && level == 0)
		{
			dbHelper.deleteObject(new_admin);
			logeer.info("DELETE_ADMIN_USER:"+new_admin.uid+" level:"+new_admin.level);
			return new ResException(null);
		}
		
		
		boolean isProxy=(level & 1<<PROXY_LEVEL)>0;
		User user=dbHelper.findObjectByUid(uid, User.class);
		if(user == null) return new ResException("ERROR_USER_NOT_FOUND");
		user.isProxy=isProxy;
		boolean create_new=new_admin==null;
		if(create_new)new_admin=new AdminUser();
		new_admin.level=level;
		new_admin.nick=user.nick;
		new_admin.uid=user.uid;
		new_admin.password=user.openid;
		dbHelper.updateObject(user, false);
		if(create_new)dbHelper.saveObject(new_admin);
		else dbHelper.updateObject(new_admin, false);
		logeer.info("UPDATE_ADMIN_USER:"+new_admin.uid+" level:"+new_admin.level);
		HashMap<String, Object> ret=new HashMap<>();
		ret.put("isNew", create_new);
		
		if(create_new)
		{
			ret.put("account", new_admin.uid);
			ret.put("pwd",new_admin.password);
		}
		return ret;
	}
	@RequestMapping(value = "/setGoldOrDiamond",method=RequestMethod.POST)
	@ResponseBody
	Object setGoldOrDiamond(String uid,boolean isGold,int set,HttpServletRequest request)
	{
		AdminUser admin=(AdminUser) request.getSession().getAttribute(LoginInterceptor.SESSION_KEY_PREFIX);
		if((1<<admin.level&ROOT_LEVEL)==0)return new ResException("ERROR_LOW_PERMISSION");
		User user=dbHelper.findObjectByUid(uid, User.class);
		if(user == null) return new ResException("ERROR_USER_NOT_FOUND");
		if(isGold)user.goldCount=set;
		else user.diamondCount=set;
		dbHelper.updateObject(user, false);
		logeer.info("SET_USER_GOLD_DIAMOND:"+uid+" isGold:"+isGold+" set:"+set);
		
		return null;
	}
}
