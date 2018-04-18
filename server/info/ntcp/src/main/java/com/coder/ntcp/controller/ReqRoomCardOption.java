package com.coder.ntcp.controller;

import javax.validation.constraints.NotBlank;

public class ReqRoomCardOption{
	@NotBlank
	public String uid;
	@NotBlank
	public boolean includexi;
	@NotBlank
	public int maxUseCount;
	@NotBlank
	public int usedCount;
	@NotBlank
	public int payType;
	@NotBlank
	public int playCount;
	@NotBlank
	public int blanceRate;
}