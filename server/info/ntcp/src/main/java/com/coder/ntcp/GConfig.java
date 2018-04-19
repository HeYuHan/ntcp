package com.coder.ntcp;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
public class GConfig {
	@Value("${global.config.tokenurl}")
	public String tokenurl;
	@Value("${global.config.appid}")
	public String appid;
	@Value("${global.config.appkey}")
	public String appkey;
	@Value("${global.config.channel_token}")
	public String channel_token;
}
