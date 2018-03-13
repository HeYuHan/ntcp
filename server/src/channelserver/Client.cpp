#include "Client.h"
#include <string>
#include "Server.h"
#include "Message.h"
#include "MessageType.h"
#include "js_tools.h"
Client::Client():m_JSClient(NULL)
{
	m_Type = WEB_SOCKET;
}

Client::~Client()
{
}

void Client::OnMessage()
{
	MessageParser parser;
	int id = 0;
	char* data_start = read_position;
	char* data_end = read_end;
	if (m_JSClient)
	{
		ScriptingCore* engine = ScriptingCore::GetInstance();
		JSContext *_cx = engine->GetGlobalContext();
		JS::RootedObject obj2(_cx, m_JSClient);
		JSAutoCompartment ac4(_cx, obj2);
		jsval val = STRING_TO_JSVAL(JS_NewStringCopyN(engine->GetGlobalContext(), data_start, data_end-data_start));
		engine->CallFunction(OBJECT_TO_JSVAL(m_JSClient), "OnMessage", JS::HandleValueArray::fromMarkedLocation(1, &val));
		return;
	}
	if (!parser.DecodeMessage(this, id))
	{
		Disconnect();
		return;
	}
	switch (id)
	{
	case CM_ECHO:
	{
		BeginWrite();
		WriteData(data_start, data_end - data_start);
		EndWrite();
		break;
	}
	default:
		break;
	}
}

void Client::OnConnected()
{
	this->connection = this;
	this->stream = this;
	this->stream->Reset();
	if (m_JSClient)
	{
		ScriptingCore::GetInstance()->CallFunction(OBJECT_TO_JSVAL(m_JSClient), "OnConnected", JS::HandleValueArray::fromMarkedLocation(0, NULL));
	}
}

void Client::OnDisconnected()
{
	if (m_JSClient)
	{
		ScriptingCore::GetInstance()->CallFunction(OBJECT_TO_JSVAL(m_JSClient), "OnDisconected", JS::HandleValueArray::fromMarkedLocation(0, NULL));
		ScriptingCore::GetInstance()->RemoveObjectProxy(this);
		m_JSClient = NULL;
	}
	gServer.RemoveClient(this->uid);
	
	
}
