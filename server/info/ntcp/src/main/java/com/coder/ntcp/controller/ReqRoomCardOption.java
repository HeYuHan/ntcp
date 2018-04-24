package com.coder.ntcp.controller;

import javax.validation.constraints.NotBlank;

public class ReqRoomCardOption{
	@NotBlank
	public String uid;
	@NotBlank
	public String currencyType;
	public boolean includexi;
	@NotBlank(message="type:(Host|AA|Winer)")
	public String payType;
	public int playCount;
	public int balanceRate;
	public boolean forceNew;

}