#include "Server.h"
#include "Client.h"
#include <Timer.h>
Server gServer;
Server::Server()
{
}

Server::~Server()
{
}

void Server::OnTcpAccept(int socket, sockaddr *addr)
{
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
		c->InitSocket(socket, addr, Timer::GetEventBase());
	}
	else
	{
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
}
bool Server::Init()
{
	if (!BaseServer::Init())
	{
		return false;
	}
	RegisterJS();

	return true;
}



int Server::Run()
{
	return Init() ? 0 : -1;
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
