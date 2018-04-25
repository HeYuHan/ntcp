package com.coder.ntcp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class MvcConfig implements WebMvcConfigurer{
	 @Autowired  
    LoginInterceptor loginInterceptor;  
	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		//InterceptorRegistration addInterceptor  = registry.addInterceptor(loginInterceptor);
		//addInterceptor.addPathPatterns("/admin/*");
		//addInterceptor.excludePathPatterns("/admin/login**");
		// TODO Auto-generated method stub
		WebMvcConfigurer.super.addInterceptors(registry);
	}
}
