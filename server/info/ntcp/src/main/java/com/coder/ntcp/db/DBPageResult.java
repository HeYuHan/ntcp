package com.coder.ntcp.db;

import java.util.List;

public class DBPageResult<T> {
	public List<T> result;
	public long totle;
	public long offest;
	public int limit;
	public DBPageResult() {}
	public DBPageResult(long offset,int limit){
		this.offest=offset;
		this.limit=limit;
	}
}
