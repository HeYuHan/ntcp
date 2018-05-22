package com.coder.ntcp.common;

import static org.assertj.core.api.Assertions.assertThatIllegalStateException;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;

import java.util.ArrayList;

public class RandomInt{
	ArrayList<Integer> recoders;
	int min,max;
	boolean repeat;
	public RandomInt(int min,int max,boolean repeat) {
		this.min=min;
		this.max=max;
		this.repeat=repeat;
		this.recoders=new ArrayList<Integer>();
		if(!this.repeat) {
			for(int i=min;i<max;i++) {
				this.recoders.add(i);
			}
			int len = max-min;
			if(len>1) {
				for(int i=len-1;i>0;--i) {
					Integer value=this.recoders.get(i);
					int rand_index =  ((int)Math.floor(Math.random()*this.max))%i;
					this.recoders.set(i,this.recoders.get(rand_index));
					this.recoders.set(rand_index, value);
				}
			}
		}
	}
	public int get() throws Exception {
		if(this.repeat) {
			int range = this.max - this.min;
            return (int)Math.floor(Math.random() * range) + this.min;
		}
		else {
			if(this.recoders.size()==0) {
				throw new Exception("random recoder is empty");
			}
			return this.recoders.remove(0);
		}
	}
	public boolean getByInput(int input) {
		for(int i=0;i<this.recoders.size();i++) {
			if(this.recoders.get(i)== input) {
				this.recoders.remove(i);
				return true;
			}
		}
		return false;
	}
	public int size() {
		return this.recoders.size();
	}
	public void releaseValue(int newvalue) {
		if(newvalue>=this.min && newvalue<=this.max&&this.recoders.contains((Integer)newvalue)){
			this.recoders.add(newvalue);
		}
	}
	public ArrayList<Integer> copyToArray() {
		ArrayList<Integer> clone = (ArrayList<Integer>) this.recoders.clone();
		return clone;
	}
}
