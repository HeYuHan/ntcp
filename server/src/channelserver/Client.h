#pragma once
#ifndef __CHANNEL_CLIENT_H__
#define __CHANNEL_CLIENT_H__
#include <TcpConnection.h>
#include <NetworkConnection.h>
#include <common.h>
#include "javascript.h"
class Client:public TcpConnection,public NetworkStream
{
public:
	Client();
	~Client();
	virtual void OnMessage();
	virtual void OnConnected();
	virtual void OnDisconnected();
	void SetJSObject(JS_OBJECT obj);
public:
	uint uid;
	
private:
	bool m_SetJSObject;
	JS_OBJECT m_JSClient;
};

#endif // !__CHANNEL_CLIENT_H__
