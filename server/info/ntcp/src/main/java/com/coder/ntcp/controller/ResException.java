package com.coder.ntcp.controller;

public class ResException {
	public String error;
	public String msg;
	public ResException(String error) {
		this.error=error;
	}
	public ResException(String error,String msg) {
		this.error=error;
		this.msg=msg;
	}
}
