package com.coder.ntcp.controller;



import static org.hamcrest.CoreMatchers.nullValue;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;

import org.mockito.internal.matchers.InstanceOf.VarArgAware;
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
import com.coder.ntcp.db.CurrencyType;
import com.coder.ntcp.db.DBHelper;
import com.coder.ntcp.db.DBPageResult;
import com.coder.ntcp.db.ItemType;
import com.coder.ntcp.db.Price;
import com.coder.ntcp.db.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

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
class EditPrice{
	public ItemType itemType;
	public CurrencyType currencyType;
	public int itemCount;
	public int price;
	public String uid;
	public EditPrice() {};
	public EditPrice(Price dbPrice) {
		this.uid=dbPrice.uid;
		this.itemCount=dbPrice.itemCount;
		this.price=dbPrice.price;
		this.itemType=dbPrice.itemType;
		this.currencyType=dbPrice.currencyType;
	}
}
class ReqUpdateUser{
	@NotBlank(message = "uid is need")
	public String uid;
	public boolean setLevel;
	public boolean setGold;
	public boolean setDiamond;
	public int goldCount;
	public int diamondCount;
	public int level;
	
}
class ReqLikeQuery
{
	public String key;
	public String value;
}
class ReqPageData
{
	public int offset;
	public int limit;
	public ReqLikeQuery[] likeQuery=new ReqLikeQuery[0];
}
class ReqUpdatePrice extends EditPrice{
	public boolean delete;
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
		User dbUser=dbHelper.findObjectByUid(user.uid, User.class);
		if(dbUser!=null)
		{
			map.put("diamond", dbUser.diamondCount);
			map.put("gold", dbUser.goldCount);
		}
		else {
			map.put("diamond", 0);
			map.put("gold", 0);
		}
		return "/admin";
	}
	@RequestMapping("/login")
	String login() {
		return "/html/login.html";
	}
	@RequestMapping("/test")
	String test(HttpServletRequest request) {
		AdminUser admin=(AdminUser) request.getSession().getAttribute(LoginInterceptor.SESSION_KEY_PREFIX);
		if((1<<admin.level&ROOT_LEVEL)==0)return "redirect:/admin/login";
		return "/test/index.html";
	}
	@RequestMapping(value = "/getPrices",method=RequestMethod.POST)
	@ResponseBody
	Object getPrices(@RequestBody @Valid ReqPageData reqPageData)
	{
		if(reqPageData.offset<0||reqPageData.limit<=0)return null;
		ArrayList<EditPrice> users=new ArrayList<EditPrice>();
		DBPageResult<Price> queryRet=new DBPageResult<Price>(reqPageData.offset, reqPageData.limit);
		 dbHelper.findAll(queryRet,Price.class);
		 for(Price u : queryRet.result) {
				users.add(new EditPrice(u));
			}
		HashMap<String, Object> ret=new HashMap<>();
		ret.put("total", queryRet.totle);
		ret.put("page",(int)Math.ceil(queryRet.offest/queryRet.limit+0.1));
		ret.put("rows", users);
		return ret;
	}
	
	@RequestMapping(value = "/updatePrice",method=RequestMethod.POST)
	@ResponseBody
	Object updatePrice(@RequestBody @Valid ReqUpdatePrice reqUpdatePrice)
	{
		String uid=Price.CaculateUid(reqUpdatePrice.itemType, reqUpdatePrice.currencyType, reqUpdatePrice.itemCount);
		Price price = dbHelper.findObjectByUid(uid, Price.class);
		if(!reqUpdatePrice.delete) {
			
			
			if(price != null) {
				price.price=reqUpdatePrice.price;
				dbHelper.updateObject(price, false);
			}
			else {
				price = new Price();
				price.itemType=reqUpdatePrice.itemType;
				price.currencyType=reqUpdatePrice.currencyType;
				price.price=reqUpdatePrice.price;
				price.itemCount=reqUpdatePrice.itemCount;
				price.uid=uid;
				dbHelper.saveObject(price);
				return new ResException("","CREATE_NEW_PRICE");
			}
		}
		else {
			if(price != null) {
				if(dbHelper.getCount(Price.class)>1) {
					dbHelper.deleteObjectByKey(uid, Price.class);
					return new ResException("","DELETE_PRICE");
				}
				else {
					return new ResException("ERROR_DELET_LAST");
				}
			}
			else {
				return new ResException("ERROR_PRICE_NOT_FOUND");
			}
		}
		return new ResException("");
	}
	
	@RequestMapping(value = "/getUsers",method=RequestMethod.POST)
	@ResponseBody
	Object getUsers(@RequestBody @Valid ReqPageData reqPageData)
	{
		if(reqPageData.offset<0||reqPageData.limit<=0)return null;
		ArrayList<EditUser> users=new ArrayList<EditUser>();
		DBPageResult<User> queryRet=new DBPageResult<User>(reqPageData.offset, reqPageData.limit);
		for(ReqLikeQuery l : reqPageData.likeQuery) {
			if(l.key.equals("")||l.value.equals("")) {
				continue;
			}
			queryRet.likeQuery.put(l.key, l.value);
		}
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
	Object getProxys(@RequestBody @Valid ReqPageData reqPageData)
	{
		if(reqPageData.offset<0||reqPageData.limit<=0)return null;
		
		ArrayList<EditUser> users=new ArrayList<EditUser>();
		DBPageResult<User> queryRet=new DBPageResult<User>(reqPageData.offset, reqPageData.limit);
		for(ReqLikeQuery l : reqPageData.likeQuery) {
			if(l.key.equals("")||l.value.equals("")) {
				continue;
			}
			queryRet.likeQuery.put(l.key, l.value);
		}
		
		dbHelper.findProxys(queryRet);
		for(User u : queryRet.result) {
			users.add(new EditUser(u));
		}
		HashMap<String, Object> ret=new HashMap<>();
		ret.put("total", queryRet.totle);
		ret.put("page",(int)Math.ceil(queryRet.offest/queryRet.limit+0.1));
		ret.put("rows", users);
		return ret;
	}
	@SuppressWarnings("finally")
	@RequestMapping(value = "/updateUser",method=RequestMethod.POST)
	@ResponseBody
	Object updateUser(@RequestBody @Valid ReqUpdateUser updateUser,HttpServletRequest request)
	{
		AdminUser admin=(AdminUser) request.getSession().getAttribute(LoginInterceptor.SESSION_KEY_PREFIX);
		if(((1<<admin.level&PROXY_LEVEL)+(1<<admin.level&ROOT_LEVEL)==0))return new ResException("ERROR_LOW_PERMISSION");
		boolean isRoot=(1<<admin.level&ROOT_LEVEL)>0;
		User dbUser=dbHelper.findObjectByUid(updateUser.uid, User.class);
		if(dbUser == null)return new ResException("ERROR_USER_NOT_FOUND");
		User adminUser=dbHelper.findObjectByUid(admin.uid, User.class);
		if(!isRoot&&adminUser == null)return new ResException("ERROR_PROXY_NOT_FOUND");
		HashMap<String, Object> ret=new HashMap<>();
		if((1<<admin.level&ROOT_LEVEL)==0)
		{
			if(adminUser.uid.equals(updateUser.uid))return new ResException("ERROR_USER_ID");
			if(updateUser.setGold)
			{
				if(adminUser.goldCount<updateUser.goldCount)return new ResException("ERROR_PROXY_GOLD");
				adminUser.goldCount-=updateUser.goldCount;
			}
			if(updateUser.setDiamond)
			{
				if(adminUser.diamondCount<updateUser.diamondCount)return new ResException("ERROR_PROXY_DIAMOND");
				adminUser.diamondCount-=updateUser.diamondCount;
			}
			ret.put("diamondCount", adminUser.diamondCount);
			ret.put("goldCount",adminUser.goldCount);
			dbHelper.updateObject(adminUser, false);
			
			dbUser.diamondCount+=updateUser.diamondCount;
			dbUser.goldCount+=updateUser.goldCount;
			
			dbHelper.updateObject(dbUser, false);
		}
		else
		{
			if(updateUser.setDiamond)dbUser.diamondCount=updateUser.diamondCount;
			if(updateUser.setGold)dbUser.goldCount=updateUser.goldCount;
			if(updateUser.setLevel){
				dbUser.isProxy=updateUser.level==4;
				AdminUser new_admin=dbHelper.findObjectByUid(updateUser.uid, AdminUser.class);
				boolean create_new=new_admin==null;
				if(create_new)new_admin=new AdminUser();
				new_admin.level=updateUser.level;
				new_admin.nick=dbUser.nick;
				new_admin.uid=dbUser.uid;
				new_admin.password=dbUser.openid;
				if(create_new)dbHelper.saveObject(new_admin);
				else dbHelper.updateObject(new_admin, false);
				ret.put("isNew", create_new);
				if(create_new)
				{
					ret.put("account", new_admin.uid);
					ret.put("pwd",new_admin.password);
				}
			}
			dbHelper.updateObject(dbUser, false);
		}
		
		try {
			ObjectMapper mapper = new ObjectMapper();
			String writeValueAsString = mapper.writeValueAsString(updateUser);
			logeer.info("UPDATE_USER=>admin:"+admin.uid+" target:"+writeValueAsString);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		finally {
			return ret;
		} 
		
	}
}
