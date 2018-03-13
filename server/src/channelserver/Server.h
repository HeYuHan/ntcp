#pragma once
#ifndef __CHANNEL_SERVER_H__
#define __CHANNEL_SERVER_H__
#include <TcpListener.h>
#include <BaseServer.h>
#include <objectpool.h>
#include "Client.h"
class Server:public BaseServer,public TcpListener
{
public:
	Server();
	~Server();
public:
	virtual void OnTcpAccept(int socket, sockaddr*);
	virtual bool Init();
	virtual int Run();
	Client* GetClient(uint uid);
	void RemoveClient(uint uid);
public:
	JSObject* m_JSObject;
public:
	ObjectPool<Client> m_OnLineClients;
};
extern Server gServer;


#endif // !__CHANNEL_SERVER_H__
