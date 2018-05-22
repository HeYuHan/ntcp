#include "Server.h"
#include "ScriptingCore.h"
using namespace v8;
#define V8_STR(x) v8::String::NewFromUtf8(Isolate::GetCurrent(),x)
#define G_ISOLATE() ScriptEngine::GetInstance()->GetIsolate()
#define GENGINE() ScriptEngine::GetInstance()
void reg_func(Local<Template> class_template, v8::Isolate* isolate,const char* name, FunctionCallback call)
{
	class_template->Set(String::NewFromUtf8(isolate, name), FunctionTemplate::New(isolate, call));
}
Local<FunctionTemplate> class_template;
void register_server_class(v8::Handle<v8::ObjectTemplate> global, v8::Isolate* isolate) 
{
	class_template = FunctionTemplate::New(isolate);
	reg_func(class_template, isolate, "Get", [](const FunctionCallbackInfo<Value>& args) {
		//if (gServer.m_JSObject.IsEmpty()) {
		//	auto m_Context = G_ISOLATE()->GetCurrentContext();
		//	Local<Value> server = m_Context->Global()->Get(String::NewFromUtf8(G_ISOLATE(), "Server"));
		//	if (server->IsFunction()) {
		//		Local<Function> func = Local<Function>::Cast(server);
		//		Local<Value> value = func->CallAsConstructor(m_Context, 0, NULL).ToLocalChecked();
		//		gServer.m_JSObject = Local<Object>::Cast(value);
		//	}
		//	//gServer.m_JSObject = Local<Object>::Cast(class_template->GetFunction()->CallAsConstructor(G_ISOLATE()->GetCurrentContext(), 0, NULL).ToLocalChecked());
		//}
		args.GetReturnValue().Set(gServer.m_JSObject);
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
	/*class_proto->SetAccessor(String::NewFromUtf8(G_ISOLATE(), "OnAccept"), [](Local<String> property, const PropertyCallbackInfo<Value>& info) {
	});
	reg_func(class_proto, isolate, "OnAccept", [](const FunctionCallbackInfo<Value>& args) {
		args.GetReturnValue().Set(v8::Boolean::New(G_ISOLATE(), gServer.Loop()));
	});*/
	class_template->InstanceTemplate()->SetInternalFieldCount(3);
	
	global->Set(String::NewFromUtf8(isolate, "Server"), class_template);
	
}
void register_file_helper_class(v8::Handle<v8::ObjectTemplate> global, v8::Isolate* isolate)
{
	Local<FunctionTemplate> class_template = FunctionTemplate::New(isolate);
	reg_func(class_template, isolate, "LoadScript", [](const FunctionCallbackInfo<Value>& args) {
		String::Utf8Value path(args[0]->ToString());
		bool ret = GENGINE()->ReadScriptFile(*path);
		args.GetReturnValue().Set(Boolean::New(G_ISOLATE(), ret));

	});
	reg_func(class_template, isolate, "MainScriptPath", [](const FunctionCallbackInfo<Value>& args) {
		Local<String> path = String::NewFromUtf8(G_ISOLATE(), gServer.m_MainScriptPath);
		args.GetReturnValue().Set(path);

	});
	reg_func(class_template, isolate, "Read", [](const FunctionCallbackInfo<Value>& args) {
		//args.GetReturnValue().Set(gServer.m_JSObject);
	});
	reg_func(class_template, isolate, "Write", [](const FunctionCallbackInfo<Value>& args) {
		//args.GetReturnValue().Set(gServer.m_JSObject);
	});


	global->Set(String::NewFromUtf8(isolate, "FileHelper"), class_template);
}
void register_log_class(v8::Handle<v8::ObjectTemplate> global, v8::Isolate* isolate)
{
	Local<FunctionTemplate> class_template = FunctionTemplate::New(isolate);
	reg_func(class_template, isolate, "Log", [](const FunctionCallbackInfo<Value>& args) {
		int id = args[0]->ToInt32(G_ISOLATE())->Int32Value();
		String::Utf8Value msg(args[1]->ToString());
		if (id == 1)log_debug("%s", *msg);
		if (id == 2)log_warn("%s", *msg);
		if (id == 3)log_error("%s", *msg);

	});

	global->Set(String::NewFromUtf8(isolate, "Debug"), class_template);
}

void register_all_native()
{
	auto engine = ScriptEngine::GetInstance();
	engine->RegisterNative(register_log_class);
	engine->RegisterNative(register_server_class);
	engine->RegisterNative(register_file_helper_class);
}