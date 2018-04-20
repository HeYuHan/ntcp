package com.coder.ntcp.controller;

import javax.validation.constraints.NotBlank;

public class ReqRoomCardOption{
	@NotBlank
	public String uid;
	public boolean includexi;
	public int payType;
	public int playCount;
	public int blanceRate;
	public boolean froceNew;
}