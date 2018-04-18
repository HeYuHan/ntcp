package com.coder.ntcp.common;

import static org.mockito.Mockito.RETURNS_DEEP_STUBS;

import java.util.ArrayList;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;


public class Tools {
	
	
	
	public static String httpGet(String url)
	{
		RestTemplate client=new RestTemplate();
		ResponseEntity<String> response = client.getForEntity(url,String.class);
		return response.getBody();
		
	}
}
