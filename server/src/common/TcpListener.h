#pragma once
#ifndef __TCPLISTENER_H__
#define __TCPLISTENER_H__
#include <event2/event.h>
#include <event2/event_struct.h>
#include <event2/bufferevent.h>
#include <event2/buffer.h>
#include <event2/listener.h>
#include <string>
class TcpListener
{
public:
	int m_Socket;
	struct sockaddr_in m_ListenAddr;
	evconnlistener *m_Listener;
public:
	TcpListener();
	~TcpListener();
public:
	bool CreateTcpServer(const char *addr, int max_client);
	bool CreateTcpServer(const char *ip, int port, int max_client);
	static void ListenEvent(evconnlistener *listener, evutil_socket_t fd, sockaddr *sock, int socklen, void *arg);
	virtual void OnTcpAccept(int socket, sockaddr*)=0;
};

#endif // !__TCPLISTENER_H__
