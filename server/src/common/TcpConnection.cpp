#include "TcpConnection.h"
#include<string.h>
#ifndef _WIN32
#include <sys/socket.h>
#include <arpa/inet.h>
#include  <netinet/in.h>
#include <netinet/tcp.h>
#include <unistd.h>
#endif // !_WIN32
#include <sys/types.h>
#include "base64.h"
#include <stdio.h>
#include <ostream>
#include<sstream>
#include "tools.h"
#include "log.h"
TcpConnection::TcpConnection() :
	m_Socket(-1),
	m_BufferEvent(NULL),
	m_HandShake(false),
	m_NeedColse(false)
{
	m_Type = TCP_SOCKET;
}

TcpConnection::~TcpConnection()
{
	m_BufferEvent = NULL;
	//if (m_Socket > 0)evutil_closesocket(m_Socket);
	m_Socket = -1;
}

void TcpConnection::Update(float time)
{
}

int TcpConnection::Read(void * data, int size)
{
	if (m_BufferEvent)
	{
		return bufferevent_read(m_BufferEvent, data, size);
	}
	return 0;
}

int TcpConnection::Send(void * data, int size)
{
	if (m_BufferEvent)
	{
		int ret = bufferevent_write(m_BufferEvent, data, size);
		return ret == 0?size :0;
	}
	return 0;
}

void TcpConnection::InitSocket(evutil_socket_t socket, sockaddr * addr, event_base * base)
{
	m_NeedColse = false;
	m_HandShake = false;
	m_Socket = socket;
	
#ifdef LINUX
	int keepAlive = 1; // 开启keepalive属性
	int keepIdle = 30; // 如该连接在60秒内没有任何数据往来,则进行探测 
	int keepInterval = 5; // 探测时发包的时间间隔为5 秒
	int keepCount = 3; // 探测尝试的次数.如果第1次探测包就收到响应了,则后2次的不再发.

	setsockopt(socket, SOL_SOCKET, SO_KEEPALIVE, (void*)&keepAlive, sizeof(keepAlive));
	setsockopt(socket, SOL_TCP, TCP_KEEPIDLE, (void*)&keepIdle, sizeof(keepIdle));
	setsockopt(socket, SOL_TCP, TCP_KEEPINTVL, (void *)&keepInterval, sizeof(keepInterval));
	setsockopt(socket, SOL_TCP, TCP_KEEPCNT, (void *)&keepCount, sizeof(keepCount));
#endif

	m_BufferEvent = bufferevent_socket_new(base, socket, BEV_OPT_CLOSE_ON_FREE);
	bufferevent_setcb(m_BufferEvent, ReadEvent, WriteEvent, SocketEvent, this);
	bufferevent_enable(m_BufferEvent, EV_READ | EV_WRITE | EV_PERSIST | EV_TIMEOUT | EV_CLOSED);
	OnConnected();
}

bool TcpConnection::Connect(const char * ip, int port, event_base * base)
{
	m_BufferEvent = bufferevent_socket_new(base, -1, BEV_OPT_CLOSE_ON_FREE);
	sockaddr_in addr;
	memset(&addr, 0, sizeof(addr));
	addr.sin_family = AF_INET;
	addr.sin_port = htons(port);
	addr.sin_addr.s_addr = inet_addr(ip);
	if (0 == bufferevent_socket_connect(m_BufferEvent, (sockaddr*)&addr, sizeof(addr)))
	{
		m_Socket = bufferevent_getfd(m_BufferEvent);
		bufferevent_setcb(m_BufferEvent, ReadEvent, WriteEvent, SocketEvent, this);
		bufferevent_enable(m_BufferEvent, EV_READ | EV_WRITE | EV_PERSIST| EV_TIMEOUT|EV_CLOSED);
		OnConnected();
		return true;
	}
	else
	{
		bufferevent_free(m_BufferEvent);
		m_BufferEvent = NULL;
		return false;
	}

	
}

void TcpConnection::Disconnect()
{
	log_info("client disconnected fd:%d,line:%d", m_Socket,__LINE__);
	bufferevent_flush(m_BufferEvent, EV_WRITE, BEV_NORMAL);
	bufferevent_free(m_BufferEvent);
	evutil_closesocket(m_Socket);
	m_Socket = -1;
	m_BufferEvent = NULL;
	m_HandShake = false;
	OnDisconnected();
}

void TcpConnection::CloseOnSendEnd()
{
	//m_NeedColse = true;
	//struct evbuffer *buffer = bufferevent_get_output(m_BufferEvent);
	//if (buffer)
	//{
	//	size_t t = evbuffer_get_length(buffer);
	//	if (t == 0)
	//	{
	//		m_NeedColse = false;
	//		Disconnect();
	//	}
	//}
}

void TcpConnection::HandShake()
{
	if (m_HandShake)return;
	int size = Read(stream->read_offset,stream->read_buff_end-stream->read_offset);
	// 解析http请求头信息
	std::istringstream string_stream(stream->read_position);
	std::string header;
	std::string::size_type pos = 0;
	std::string websocketKey;
	bool find = false;
	while (std::getline(string_stream, header) && header != "\r")
	{
		header.erase(header.end() - 1);
		pos = header.find(": ", 0);
		if (pos != std::string::npos)
		{
			std::string key = header.substr(0, pos);
			std::string value = header.substr(pos + 2);
			if (key == "Sec-WebSocket-Key")
			{
				find = true;
				websocketKey = value;
				break;
			}
		}
	}
	if (!find)
	{
		this->stream->read_offset += size;
		return;
	}
	m_HandShake = true;
	// 填充http响应头信息
	std::string response = "HTTP/1.1 101 Switching Protocols\r\n";
	response += "Connection: upgrade\r\n";
	response += "Sec-WebSocket-Accept: ";

	const std::string magicKey("258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
	std::string serverKey = websocketKey + magicKey;

	char shaHash[20];
	memset(shaHash, 0, sizeof(shaHash));
	CaculateSha1(serverKey.c_str(), shaHash);
	char base64[128] = { 0 };
	base64_encode((unsigned char*)shaHash, base64, 20);
	serverKey = base64;
	serverKey += "\r\n";
	response += serverKey;
	response += "Upgrade: websocket\r\n\r\n";
	int res_size = response.size();
	Send((void*)response.c_str(), res_size);
	this->stream->Reset();
}
void TcpConnection::ReadEvent(bufferevent * bev, void * arg)
{
	//int fd = bufferevent_getfd(bev);
	//log_info("socket reade event fd:%d", fd);
	TcpConnection* con = static_cast<TcpConnection*>(arg);
	if (con && !con->m_HandShake)con->HandShake();
	else if (con&&con->stream)con->stream->OnRevcMessage();
}

void TcpConnection::WriteEvent(bufferevent * bev, void * arg)
{
	/*TcpConnection* c = (TcpConnection*)arg;
	if (c->m_NeedColse)
	{
		c->m_NeedColse = false;
		c->Disconnect();
	}*/
}

void TcpConnection::SocketEvent(bufferevent * bev, short events, void * arg)
{
	if (events & BEV_EVENT_EOF) {
		printf("connection closed\n");
	}
	else if (events & BEV_EVENT_ERROR) {
		printf("some other error\n");
	}
	int fd = bufferevent_getfd(bev);
	log_info("socket error call event:%d fd:%d", events, fd);
	TcpConnection* c = (TcpConnection*)arg;
	c->Disconnect();
}
