package com.coder.ntcp.controller;

import javax.validation.constraints.NotBlank;

public class ReqRoomCardOption{
	@NotBlank
	public String uid;
	@NotBlank(message="Gold|Diamond")
	public String currencyType;
	public boolean includexi;
	@NotBlank(message="Host|AA|Winer")
	public String payType;
	public int playCount;
	public int[] balanceRate=new int[3];
	public int maxScore=0;

}