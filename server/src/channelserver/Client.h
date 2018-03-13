#pragma once
#ifndef __CHANNEL_CLIENT_H__
#define __CHANNEL_CLIENT_H__
#include <TcpConnection.h>
#include <NetworkConnection.h>
#include <common.h>
#include <jsapi.h>
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
	JSObject* m_JSClient;
private:

};

#endif // !__CHANNEL_CLIENT_H__
