package com.coder.ntcp.common;


import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.web.client.RestTemplate;


public class Tools {
	
	
	
	public static String httpGet(String url)
	{
		//utf-8
		RestTemplate client=new RestTemplate();
		StringHttpMessageConverter stringHttpMessageConverter=new StringHttpMessageConverter(StandardCharsets.UTF_8);    
	    List<HttpMessageConverter<?>> list=new ArrayList<HttpMessageConverter<?>>();   
	    list.add(stringHttpMessageConverter);  
	    client.setMessageConverters(list); 
		ResponseEntity<String> response = client.getForEntity(url,String.class);
		return response.getBody();
		
	}
}
