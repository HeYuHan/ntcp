package com.coder.ntcp.db;


public class RoomPlayer {
	public String userid;
	public int[] scores=new int[15];
	public RoomPlayer() {
		for(int i=0;i<scores.length;i++) {
			this.scores[i]=0;
		}
	}
}
