#include "Client.h"
#include <string>
#include "Server.h"
#include "Message.h"
#include "MessageType.h"
#include "js_tools.h"
#include "ScriptingCore.h"
Client::Client()
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
	//if (m_SetJSObject)
	//{
	//	ScriptingCore* engine = ScriptingCore::GetInstance();
	//	JSContext *_cx = engine->GetGlobalContext();
	//	jsval val = c_string_to_jsval(engine->GetGlobalContext(), data_start, data_end-data_start);
	//	engine->CallFunction(OBJECT_TO_JSVAL(m_JSClient), "OnMessage", JS::HandleValueArray::fromMarkedLocation(1, &val));
	//	return;
	//}
	if (!m_JSClient.IsEmpty())
	{
		JSArg arg(data_start, data_end - data_start);
		ScriptEngine::GetInstance()->CallFunction(m_JSClient, "OnMessage");
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
	if (this->m_JSClient.IsEmpty())
	{
		Disconnect();
		return;
	}
	auto engine = ScriptEngine::GetInstance();
	m_JSClient->SetInternalField(0, v8::External::New(engine->GetIsolate(), this));
	engine->CallFunction(m_JSClient, "OnConnected");


	//if (m_JSClient)
	//{
	//	auto engine = ScriptingCore::GetInstance();
	//	JSAutoCompartment ac(engine->GetGlobalContext(), m_JSClient);
	//	JS::RootedObject obj(engine->GetGlobalContext(), m_JSClient);
	//	engine->CallFunction(OBJECT_TO_JSVAL(obj), "OnConnected");
	//}
}

void Client::OnDisconnected()
{
	/*if (m_JSClient)
	{
		auto engine = ScriptingCore::GetInstance();
		engine->CallFunction(OBJECT_TO_JSVAL(obj), "OnDisconected");
		engine->RemoveObjectProxy(this);
		m_JSClient = NULL;
	}*/
	ScriptEngine::GetInstance()->CallFunction(m_JSClient, "OnConnected");
	if (!m_JSClient.IsEmpty())
	{
		m_JSClient.Clear();
	}
	gServer.RemoveClient(this->uid);
	
	
}
