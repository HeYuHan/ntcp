package com.coder.ntcp;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix="global.config")
public class GConfig {
	public String tokenurl;
	public String appid;
	public String appkey;
}
