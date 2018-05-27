#pragma once
#ifndef __CHANNEL_SERVER_H__
#define __CHANNEL_SERVER_H__
#include <TcpListener.h>
#include <BaseServer.h>
#include <objectpool.h>
#include "Client.h"
#include <FileReader.h>
#include <Timer.h>
class Server:public BaseServer,public TcpListener
{
public:
	Server();
	~Server();
public:
	virtual void OnTcpAccept(evutil_socket_t socket, sockaddr*);
	virtual bool Init();
	virtual int Run();
	virtual void OnUpdate(float t);
	int Loop();
	Client* GetClient(uint uid);
	void RemoveClient(uint uid);
	char m_MainScriptPath[512];
	char m_Addr[128];
private:
	Timer m_UpdateTimer;
	JS_FUNC m_JSUpdateFunc;
public:
	JS_OBJECT m_JSObject;

public:
	ObjectPool<Client> m_OnLineClients;
	ObjectPool<AsyncFileWriter> m_FileWriters;
};
extern Server gServer;
void register_all_native();

#endif // !__CHANNEL_SERVER_H__
