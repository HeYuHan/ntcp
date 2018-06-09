#pragma once
#ifndef __HTTP_CLIENT_H__
#define __HTTP_CLIENT_H__
#include "TcpConnection.h"
class HttpClient:public TcpConnection,public NetworkStream
{
	enum 
	{
		HTTP_CLIENT_GET,
		HTTP_CLIENT_POST
	};
public:
	HttpClient();
	~HttpClient();
public:
	virtual void OnRevcMessage();
	bool Post(const char* url, const char* data, const char* contentType = 0);
	bool Get(const char* url);
	bool Request(const char* host, int port, const char* query);


	virtual void OnMessage();
	virtual void OnConnected();
	virtual void OnDisconnected();
	virtual void Disconnect();
private:
};


#endif