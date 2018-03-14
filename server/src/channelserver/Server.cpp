#include "Server.h"
#include "Client.h"
#include <Timer.h>
#include "js_tools.h"
#include "jsb.h"
Server gServer;
Server::Server():m_JSObject(NULL)
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
		if (gServer.m_JSObject)
		{
			jsval vals;
			vals = UINT_TO_JSVAL(c->uid);
			ScriptingCore::GetInstance()->CallFunction(OBJECT_TO_JSVAL(gServer.m_JSObject), "OnAccept", JS::HandleValueArray::fromMarkedLocation(1, &vals));
		}
		c->InitSocket(socket, addr, Timer::GetEventBase());
	}
	else
	{
		log_error("%s", "allocate client failed");
	}
}
void RegisterJS()
{

	auto engine = ScriptingCore::GetInstance();
	engine->RegisterJSClass(js_register_String);
	engine->RegisterJSClass(js_register_Log);
	engine->RegisterJSClass(js_register_Server);
	engine->RegisterJSClass(js_register_Client);
	engine->RegisterJSClass(js_register_File);
	engine->RegisterJSClass(js_register_Timer);
	engine->RegisterJSClass(js_register_Http);
	

	engine->Start();
	auto _global = engine->GetGlobalObject();
	auto _cx = engine->GetGlobalContext();
	JS::RootedObject global(_cx, _global);
	//JSAutoCompartment ac4(_cx, global);
	//engine->Eval("JSON.parse([1]);");
	//JS::RootedValue rval3(_cx);
	//bool ret = engine->Eval("var today = Server.GetServerName();return today",rval3);
	engine->RunScript(gServer.m_MainScriptPath);

	//JS::RootedObject obj2(_cx, _global);
	//JSAutoCompartment ac4(_cx, obj2);
	//jsval vals[3];
	//vals[0] = INT_TO_JSVAL(123);

	//vals[1] = STRING_TO_JSVAL(JS_NewStringCopyN(_cx, "sadf", 4));
	//vals[2] = STRING_TO_JSVAL(JS_NewStringCopyN(_cx, "11111", 5));
	//JS::RootedValue rval2(_cx);
	////JS::RootedObject obj3(_cx, _global->get());
	////JSAutoCompartment ac5(_cx, obj3);
	//engine->CallFunction(OBJECT_TO_JSVAL(_global), "calljs", JS::HandleValueArray::fromMarkedLocation(1, vals), &rval2);
	//bool evaluatedOK = JS_CallFunctionName(_cx, global, "calljs", JS::HandleValueArray::fromMarkedLocation(2, vals), &rval2);
	//std::cout << JS_EncodeStringToUTF8(_cx, JS::RootedString(_cx, rval2.toString()));
	//JS::RootedValue rval3(val);
	//JS::RootedObject obj4(_cx, _global->get());
	//JSAutoCompartment ac6(_cx, obj4);
	//JS_GetProperty(_cx, global, "today", &rval3);

	//std::cout << JS_EncodeStringToUTF8(_cx, JS::RootedString(_cx, JS::ToString(_cx, rval3)));
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
	
	Init();
	//CreateTcpServer("192.168.2.103", 9300, 50);
	
	return Init() ? 0 : -1;
}

int Server::Loop()
{
	 return BaseServer::Run();
}

Client * Server::GetClient(uint uid)
{
	return m_OnLineClients.Get(uid);
}


void Server::RemoveClient(uint uid)
{
	m_OnLineClients.Free(uid);
}
