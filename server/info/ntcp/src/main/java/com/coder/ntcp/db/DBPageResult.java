package com.coder.ntcp.db;

import java.util.HashMap;
import java.util.List;
import java.lang.reflect.ParameterizedType;

public class DBPageResult<T> {
	public List<T> result;
	public long totle;
	public long offest;
	public int limit;
	public HashMap<String, Object> likeQuery=new HashMap<>();
	public DBPageResult() {
	}
	public DBPageResult(long offset,int limit){
		
		this.offest=offset;
		this.limit=limit;
	}
}
