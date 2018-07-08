#include "HttpClient.h"
#include <event2/http.h>
#include <RakString.h>
#include "HttpConnection4.h"
#include "Timer.h"
#include "log.h"
HttpClient::HttpClient()
{
}

HttpClient::~HttpClient()
{
}

void HttpClient::OnMessage()
{
}

void HttpClient::OnConnected()
{
}

void HttpClient::OnDisconnected()
{
	
}

void HttpClient::Disconnect()
{

}

void HttpClient::OnRevcMessage()
{
	struct evbuffer *buffer = bufferevent_get_input(m_BufferEvent);
	if (buffer)
	{

		char* line = NULL;
		do
		{
			size_t size = 0;
			line = evbuffer_readln(buffer, &size, EVBUFFER_EOL_CRLF);
			//if(line)log_info("res :%s is \\r\\n:%s", line,strcmp(line,"\r\n")==0?"true":"false");
		} while (line);

	}
}

bool HttpClient::Post(const char * url, const char * data, const char * contentType)
{
	UriParser parser;
	if (!parser.Parse(url))return false;
	RakNet::RakString rsRequest = RakNet::RakString::FormatForPOST(url, contentType, data);
	return Request(parser.host, parser.port, rsRequest.C_String());
}

bool HttpClient::Get(const char * url)
{
	UriParser parser;
	if (!parser.Parse(url))return false;
	RakNet::RakString rsRequest = RakNet::RakString::FormatForGET(url);
	return Request(parser.host, parser.port, rsRequest.C_String());
	return true;
}

bool HttpClient::Request(const char* host, int port, const char* query)
{
	this->stream = this;
	this->connection = this;
	if (Connect(host, port, Timer::GetEventBase()))
	{
		Send((void*)query, strlen(query));
		return true;
	}
	return false;
}
