#include "TcpListener.h"
#include<string.h>
#ifndef _WIN32
#include <sys/socket.h>
#include <arpa/inet.h>
#endif // !_WIN32
#include "Timer.h"
#include "tools.h"
TcpListener::TcpListener():
	m_Listener(NULL)
{
}
TcpListener::~TcpListener()
{
	if (m_Listener)
	{
		evconnlistener_free(m_Listener);
		m_Listener = NULL;
	}
}
bool TcpListener::CreateTcpServer(const char * addr, int max_client)
{
	if (!ParseSockAddr(m_ListenAddr, addr, false))return false;
	m_Listener = evconnlistener_new_bind(Timer::GetEventBase(),
		ListenEvent, this,
		LEV_OPT_REUSEABLE | LEV_OPT_CLOSE_ON_FREE | LEV_OPT_THREADSAFE,
		max_client, (sockaddr*)&m_ListenAddr, sizeof(sockaddr_in));
	return m_Listener != NULL;
}
bool TcpListener::CreateTcpServer(const char *ip, int port, int max_client)
{
	
	memset(&m_ListenAddr, 0, sizeof(m_ListenAddr));
	m_ListenAddr.sin_family = AF_INET;
	m_ListenAddr.sin_addr.s_addr = inet_addr(ip);
	m_ListenAddr.sin_port = htons(port);
	m_Listener = evconnlistener_new_bind(Timer::GetEventBase(),
		ListenEvent, this,
		LEV_OPT_REUSEABLE | LEV_OPT_CLOSE_ON_FREE | LEV_OPT_THREADSAFE,
		max_client, (sockaddr*)&m_ListenAddr, sizeof(sockaddr_in));
	return m_Listener != NULL;
}


void TcpListener::ListenEvent(evconnlistener * listener, evutil_socket_t fd, sockaddr * sock, int socklen, void * arg)
{
	TcpListener *l = (TcpListener*)arg;
	l->OnTcpAccept(fd, sock);
}