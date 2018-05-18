#include "Server.h"
#include "ScriptingCore.h"
using namespace v8;
#define V8_STR(x) v8::String::NewFromUtf8(Isolate::GetCurrent(),x)
#define G_ISOLATE() ScriptEngine::GetInstance()->GetIsolate()
void reg_func(Local<Template> class_template, v8::Isolate* isolate,const char* name, FunctionCallback call)
{
	class_template->Set(String::NewFromUtf8(isolate, name), FunctionTemplate::New(isolate, call));
}
void register_server_class(v8::Handle<v8::ObjectTemplate> global, v8::Isolate* isolate) 
{
	//gServer.m_JSObject = global->NewInstance();

	Local<FunctionTemplate> class_template = FunctionTemplate::New(isolate);
	reg_func(class_template, isolate, "Get", [](const FunctionCallbackInfo<Value>& args) {
		//args.GetReturnValue().Set(gServer.m_JSObject);
	});
	reg_func(class_template, isolate, "Platfrom", [](const FunctionCallbackInfo<Value>& args) {
#ifdef WIN32
		int p = 1;
#else
		int p = 2;
#endif // WIN32
		Local<Number> ret = Number::New(G_ISOLATE(), p);
		args.GetReturnValue().Set(ret);
	});
	Handle<ObjectTemplate> class_proto = class_template->PrototypeTemplate();
	reg_func(class_proto, isolate, "Init", [](const FunctionCallbackInfo<Value>& args) {
		String::Utf8Value profile(args[0]->ToString());
		bool ret = false;
		Json::Reader reader;
		Json::Value root;
		do
		{
			if (!reader.parse(*profile, root))break;
			std::string addr = gServer.m_Addr;
			int max_client = 50;
			if (root.isMember("addr"))
			{
				addr = root["addr"].asString();
			}
			if (root.isMember("max_client"))
			{
				max_client = root["max_client"].asInt();
			}
			int writer_count = (max_client / 3) + 1;
			ret = gServer.m_FileWriters.Initialize(writer_count);
			ret = ret && gServer.m_OnLineClients.Initialize(max_client);
			ret = ret && gServer.CreateTcpServer(addr.c_str(), max_client);
			log_debug("create server in %s max_client %d", addr.c_str(), max_client);
		} while (0);
		args.GetReturnValue().Set(v8::Boolean::New(G_ISOLATE(), ret));
	});
	reg_func(class_proto, isolate, "Start", [](const FunctionCallbackInfo<Value>& args) {
		args.GetReturnValue().Set(v8::Boolean::New(G_ISOLATE(), gServer.Loop()));
	});
	class_template->InstanceTemplate()->SetInternalFieldCount(2);

	global->Set(String::NewFromUtf8(isolate, "Server"), class_template);
}


void register_all_native()
{

}