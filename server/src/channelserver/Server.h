#pragma once
#ifndef __CHANNEL_SERVER_H__
#define __CHANNEL_SERVER_H__
#include <TcpListener.h>
#include <BaseServer.h>
#include <objectpool.h>
#include "Client.h"
#include <FileReader.h>
class Server:public BaseServer,public TcpListener
{
public:
	Server();
	~Server();
public:
	virtual void OnTcpAccept(int socket, sockaddr*);
	virtual bool Init();
	virtual int Run();
	int Loop();
	Client* GetClient(uint uid);
	void RemoveClient(uint uid);
	char m_MainScriptPath[512];
	char m_Addr[128];
public:
	JS_OBJECT m_JSObject;
public:
	ObjectPool<Client> m_OnLineClients;
	ObjectPool<AsyncFileWriter> m_FileWriters;
};
extern Server gServer;
void register_all_native();

#endif // !__CHANNEL_SERVER_H__
