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
public:
	uint uid;
	JS_OBJECT m_JSClient;
	
};
void set_client_js_object(Client* c);

#endif // !__CHANNEL_CLIENT_H__
