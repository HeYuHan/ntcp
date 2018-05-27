#include "Server.h"
#include "Client.h"
#include <Timer.h>
#include "ScriptingCore.h"
Server gServer;
Server::Server()
{
}

Server::~Server()
{
}

void UpdateServer(float t, void *arg)
{
	gServer.OnUpdate(t);
}

void Server::OnTcpAccept(evutil_socket_t socket, sockaddr *addr)
{
	if (socket == 0)
	{
		log_error("accept error socket %d", socket);
		evutil_closesocket(socket);
		return;
	}
	Client *c = m_OnLineClients.Allocate();
	if (c)
	{
		/*if (gServer.m_JSObject)
		{
			auto engine = ScriptingCore::GetInstance();
			JSAutoCompartment ac(engine->GetGlobalContext(), gServer.m_JSObject);
			JS::RootedObject obj(engine->GetGlobalContext(), gServer.m_JSObject);
			jsval vals;
			vals = UINT_TO_JSVAL(c->uid);
			ScriptingCore::GetInstance()->CallFunction(OBJECT_TO_JSVAL(obj), "OnAccept", JS::HandleValueArray::fromMarkedLocation(1, &vals));
		}*/
		set_client_js_object(c);
		auto engine = ScriptEngine::GetInstance();
		JSArg arg((size_t)c->uid);
		engine->CallFunction(m_JSObject, "OnAccept", 1, &arg);
		c->InitSocket(socket, addr, Timer::GetEventBase());
		
	}
	else
	{
		evutil_closesocket(socket);
		log_error("%s", "allocate client failed");
	}
}
void RegisterJS()
{

	/*auto engine = ScriptingCore::GetInstance();
	engine->RegisterJSClass(js_register_String);
	engine->RegisterJSClass(js_register_Log);
	engine->RegisterJSClass(js_register_Server);
	engine->RegisterJSClass(js_register_Client);
	engine->RegisterJSClass(js_register_File);
	engine->RegisterJSClass(js_register_Timer);
	engine->RegisterJSClass(js_register_Http);
	engine->RegisterJSClass(js_register_AsyncFile);
	engine->Start();
	auto _global = engine->GetGlobalObject();
	auto _cx = engine->GetGlobalContext();
	JS::RootedObject global(_cx, _global);
	engine->RunScript(gServer.m_MainScriptPath);
	engine->CallGlobalFunction("Main");
	engine->Stop();*/
	register_all_native();
	auto engine = ScriptEngine::GetInstance();
	engine->Start();
}
bool Server::Init()
{
	if (!BaseServer::Init())
	{
		return false;
	}
	this->m_UpdateTimer.Init(1, UpdateServer, this, true);
	this->m_UpdateTimer.Begin();
	RegisterJS();

	


	return true;
}



int Server::Run()
{
	return Init() ? 0 : -1;
}

void Server::OnUpdate(float t)
{
	if (!m_JSObject.IsEmpty())
	{
		auto engine = ScriptEngine::GetInstance();
		v8::Isolate* isolate = engine->GetIsolate();
		v8::Context::Scope context_scope(isolate->GetCurrentContext());
		
		if (m_JSUpdateFunc.IsEmpty())
		{
			JSArg arg(t);
			v8::Handle<v8::String> js_func_name = v8::String::NewFromUtf8(isolate, "OnUpdate");
			v8::Handle<v8::Value>  js_func_ref = m_JSObject->Get(js_func_name);
			if (js_func_ref->IsFunction())
			{
				m_JSUpdateFunc = v8::Handle<v8::Function>::Cast(js_func_ref);
			}
		}
		if(!m_JSUpdateFunc.IsEmpty())
		{
			JS_VALUE val = v8::Number::New(isolate, t);
			m_JSUpdateFunc->Call(m_JSObject, 1, &val);
		}
	}
}

int Server::Loop()
{
	int ret = BaseServer::Run();
	//ScriptingCore::GetInstance()->Stop();
	 return ret;
}

Client * Server::GetClient(uint uid)
{
	return m_OnLineClients.Get(uid);
}


void Server::RemoveClient(uint uid)
{
	m_OnLineClients.Free(uid);
}
