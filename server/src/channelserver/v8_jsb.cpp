#include "Server.h"
#include "ScriptingCore.h"
#include <Timer.h>
//#include <HttpConnection3.h>
#include <HttpConnection4.h>
#include<HTTPConnection2.h>
#include<TCPInterface.h>
#include <RakPeerInterface.h>
using namespace v8;
using namespace RakNet;
#define V8_STR(x) v8::String::NewFromUtf8(Isolate::GetCurrent(),x)
#define G_ISOLATE() ScriptEngine::GetInstance()->GetIsolate()
#define GENGINE() ScriptEngine::GetInstance()
void reg_func(Local<Template> class_template, v8::Isolate* isolate,const char* name, FunctionCallback call)
{
	class_template->Set(String::NewFromUtf8(isolate, name), FunctionTemplate::New(isolate, call));
}
Local<FunctionTemplate> server_class_template;
void register_server_class(v8::Handle<v8::ObjectTemplate> global, v8::Isolate* isolate) 
{
	server_class_template = FunctionTemplate::New(isolate);
	ScriptEngine::GetInstance()->RegisterOnScriptLoaded([]()
	{
		
		if (gServer.m_JSObject.IsEmpty()) {
			set_js_object(server_class_template, gServer.m_JSObject);
		}
	});
	
	reg_func(server_class_template, isolate, "Get", [](const FunctionCallbackInfo<Value>& args) {
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
	reg_func(server_class_template, isolate, "Platfrom", [](const FunctionCallbackInfo<Value>& args) {
#ifdef WIN32
		int p = 1;
#else
		int p = 2;
#endif // WIN32
		Local<Number> ret = Number::New(G_ISOLATE(), p);
		args.GetReturnValue().Set(ret);
	});
	Handle<ObjectTemplate> class_proto = server_class_template->PrototypeTemplate();
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
	server_class_template->InstanceTemplate()->SetInternalFieldCount(3);
	
	global->Set(String::NewFromUtf8(isolate, "Server"), server_class_template);
	
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
		String::Utf8Value path(args[0]->ToString());
		std::string content;
		if (ReadText(content, *path))
		{
			args.GetReturnValue().Set(String::NewFromUtf8(G_ISOLATE(), content.c_str()));
		}
	});
	reg_func(class_template, isolate, "Write", [](const FunctionCallbackInfo<Value>& args) {
		String::Utf8Value path(args[0]->ToString());
		String::Utf8Value content(args[1]->ToString());
		bool ok = WriteText(*content, *path);
		args.GetReturnValue().Set(Boolean::New(G_ISOLATE(), ok));
	});


	global->Set(String::NewFromUtf8(isolate, "FileHelper"), class_template);
}
void register_log_class(v8::Handle<v8::ObjectTemplate> global, v8::Isolate* isolate)
{
	Local<FunctionTemplate> class_template = FunctionTemplate::New(isolate);
	reg_func(class_template, isolate, "Log", [](const FunctionCallbackInfo<Value>& args) {
		int id = args[0]->Int32Value();
		String::Utf8Value msg(args[1]->ToString());
		if (id == 1)log_debug("%s", *msg);
		if (id == 2)log_warn("%s", *msg);
		if (id == 3)log_error("%s", *msg);

	});

	global->Set(String::NewFromUtf8(isolate, "Debug"), class_template);
}
v8::Handle<v8::FunctionTemplate> client_class_template;
void set_client_js_object(Client *c)
{
	set_js_object(client_class_template, c->m_JSClient);
}
void register_client_class(v8::Handle<v8::ObjectTemplate> global, v8::Isolate* isolate)
{
	client_class_template = FunctionTemplate::New(isolate);

	reg_func(client_class_template, isolate, "Get", [](const FunctionCallbackInfo<Value>& args) {
		uint uid = args[0]->Uint32Value();
		Client *c = gServer.GetClient(uid);
		if (c)
		{
			
			args.GetReturnValue().Set(c->m_JSClient);
		}
	});

	Handle<ObjectTemplate> class_proto = client_class_template->PrototypeTemplate();
	reg_func(class_proto, isolate, "Send", [](const FunctionCallbackInfo<Value>& args) {
		Local<Object> self = args.This();
		Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
		void* ptr = wrap->Value();
		Client* c = static_cast<Client*>(ptr);
		if (c && c->IsConnected()) {
			String::Utf8Value msg(args[0]->ToString());
			c->BeginWrite();
			c->WriteData(*msg, msg.length());
			c->EndWrite();
		}
		else
		{
			log_error("native client is null or disconnect %s","");
		}

	});
	reg_func(class_proto, isolate, "Disconnect", [](const FunctionCallbackInfo<Value>& args) {
		
		Local<Object> self = args.This();
		Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
		void* ptr = wrap->Value();
		Client* c = static_cast<Client*>(ptr);
		if (c)c->Disconnect();
		else
		{
			log_error("native client is null %s","");
		}

	});

	client_class_template->InstanceTemplate()->SetInternalFieldCount(3);
	global->Set(String::NewFromUtf8(isolate, "Client"), client_class_template);
}

void register_async_file_class(v8::Handle<v8::ObjectTemplate> global, v8::Isolate* isolate)
{
	Local<FunctionTemplate> class_template = FunctionTemplate::New(isolate, [](const FunctionCallbackInfo<Value>& args) {
	
		if (!args.IsConstructCall())return;
		AsyncFileWriter* w = gServer.m_FileWriters.Allocate();
		String::Utf8Value path(args[0]->ToString());
		if (!w->Create(*path))
		{
			gServer.m_FileWriters.Free(w->uid);
			w = NULL;
			return;
		}
		Local<External> native_ptr = External::New(args.GetIsolate(), w);
		args.This()->SetInternalField(0, native_ptr);
	
	});
	Handle<ObjectTemplate> class_proto = class_template->PrototypeTemplate();
	reg_func(class_proto, isolate, "Free", [](const FunctionCallbackInfo<Value>& args) {
		Local<Object> self = args.This();
		Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
		void* ptr = wrap->Value();
		AsyncFileWriter* w = static_cast<AsyncFileWriter*>(ptr);
		if (w)
		{
			w->Close();
			gServer.m_FileWriters.Free(w->uid);
			args.This()->SetInternalField(0, External::New(args.GetIsolate(), NULL));
		}

		args.GetReturnValue().Set(Boolean::New(G_ISOLATE(), w != NULL));

	});
	reg_func(class_proto, isolate, "Write", [](const FunctionCallbackInfo<Value>& args) {
		Local<Object> self = args.This();
		Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
		void* ptr = wrap->Value();
		AsyncFileWriter* w = static_cast<AsyncFileWriter*>(ptr);
		if (w)
		{
			String::Utf8Value content(args[0]->ToString());
			w->PushContent(*content);
		}

	});
	class_template->InstanceTemplate()->SetInternalFieldCount(2);
	global->Set(String::NewFromUtf8(isolate, "AsyncFileWriter"), class_template);
}
struct JSTimer {
	Timer m_Timer;
	v8::Global<Object> m_JSObject;
	v8::Global<Function> m_CacheFunc;
	~JSTimer() {
		m_JSObject.Reset();
		m_CacheFunc.Reset();
	}
};
void js_Timer_Update(float t, void* arg)
{
	JSTimer *js_timer = static_cast<JSTimer*>(arg);
	
	if (js_timer&&!js_timer->m_JSObject.IsEmpty())
	{
		v8::Context::Scope context_scope(G_ISOLATE()->GetCurrentContext());
		Local<Object> obj = js_timer->m_JSObject.Get(G_ISOLATE());
		if (js_timer->m_CacheFunc.IsEmpty())
		{
			
			
			JSArg arg(t);
			Handle<String> js_func_name = String::NewFromUtf8(G_ISOLATE(), "OnUpdate");
			Handle<Value>  js_func_ref = obj->Get(js_func_name);
			if (js_func_ref->IsFunction())
			{
				js_timer->m_CacheFunc.Reset(G_ISOLATE(), Handle<Function>::Cast(js_func_ref));
			}
		}
		if (!js_timer->m_CacheFunc.IsEmpty())
		{
			JS_VALUE val = v8::Number::New(G_ISOLATE(), t);
			js_timer->m_CacheFunc.Get(G_ISOLATE())->Call(obj, 1, &val);
		}
		
	}
}
void ClearWeakTimer(
	const v8::WeakCallbackInfo<JSTimer>& data) {
	printf("clear weak is called\n");
	JSTimer *tiemr = data.GetParameter();
	if(tiemr)delete[] tiemr;
}
void register_timer_class(v8::Handle<v8::ObjectTemplate> global, v8::Isolate* isolate)
{
	Local<FunctionTemplate> class_template = FunctionTemplate::New(isolate, [](const FunctionCallbackInfo<Value>& args) {

		if (!args.IsConstructCall())return;
		JSTimer* obj = new JSTimer();
		float t = args[0]->NumberValue();
		bool loop = args[1]->BooleanValue();
		obj->m_Timer.Init(t, js_Timer_Update, obj, loop);
		Local<External> native_ptr = External::New(args.GetIsolate(), obj);
		args.This()->SetInternalField(0, native_ptr);

		obj->m_JSObject.Reset(args.GetIsolate(),args.This());
		obj->m_JSObject.SetWeak(obj, &ClearWeakTimer, v8::WeakCallbackType::kParameter);

	});
	Handle<ObjectTemplate> class_proto = class_template->PrototypeTemplate();
	reg_func(class_proto, isolate, "Begin", [](const FunctionCallbackInfo<Value>& args) {
		Local<Object> self = args.This();
		Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
		void* ptr = wrap->Value();
		JSTimer* w = static_cast<JSTimer*>(ptr);
		if (w)w->m_Timer.Begin();

	});
	reg_func(class_proto, isolate, "Stop", [](const FunctionCallbackInfo<Value>& args) {
		Local<Object> self = args.This();
		Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
		void* ptr = wrap->Value();
		JSTimer* w = static_cast<JSTimer*>(ptr);
		if (w)
		{
			w->m_Timer.Stop();
			/*args.This()->SetInternalField(0, External::New(args.GetIsolate(), NULL));
			delete w;*/
		}

	});
	reg_func(class_proto, isolate, "Free", [](const FunctionCallbackInfo<Value>& args) {
		Local<Object> self = args.This();
		Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
		void* ptr = wrap->Value();
		JSTimer* w = static_cast<JSTimer*>(ptr);
		if (w)
		{
			w->m_Timer.Stop();
			args.This()->SetInternalField(0, External::New(args.GetIsolate(), NULL));
			delete w;
		}

	});
	class_template->InstanceTemplate()->SetInternalFieldCount(2);
	global->Set(String::NewFromUtf8(isolate, "Timer"), class_template);
}
class JSHttp:public HttpRequest //public IHttpInterface
{
public:
	v8::Persistent<Object> m_JSObject;
	Timer m_Timer;
	~JSHttp() {
		m_JSObject.Reset();
		m_Timer.Stop();
	}

public:
	static void Update(float t, void *arg)
	{
		JSHttp *http = (JSHttp*)arg;
		std::string ret;
		int state = http->GetResponse(ret);
		if (state > 0)http->OnResponse(state, ret.c_str(), ret.size());
	}
	void OnResponse(int state, const char* data,int len)
	{
		if (!m_JSObject.IsEmpty())
		{
			JSArg args[2] = { JSArg((size_t)state),JSArg(data,len) };

			ScriptEngine::GetInstance()->CallFunction(m_JSObject.Get(G_ISOLATE()), "OnResponse", 2, args);
			//log_info("js res:%s", data);
			delete this;

		}
	}
	bool Get(const char* url, const char* data)
	{
		if (!MakeRequest(HttpRequest::GET, url, data))
		{
			return false;
		}
		m_Timer.Init(0.01, Update, this, true);
		m_Timer.Begin();
		return true;
	}
	bool Post(const char* url, const char* data, const char* contentType)
	{
		if (!MakeRequest(HttpRequest::POST, url, data,contentType))
		{
			return false;
		}
		m_Timer.Init(0.01, Update, this, true);
		m_Timer.Begin();
		return true;
	}
	/*virtual void OnResponse() {
		log_info("call js %s", "OnResponse");
		int state = GetState();
		char msg[1024 + 1] = { 0 };
		std::string ret;
		int count = 0;
		do {
			if (state>0)count = ReadBuffer(msg, 1024);
			msg[count] = 0;
			if (count>0)ret += std::string(msg);
		} while (count > 0);
		if (!m_JSObject.IsEmpty())
		{
			JSArg args[2] = { JSArg((size_t)state),JSArg(ret.c_str(),ret.size()) };
			
			ScriptEngine::GetInstance()->CallFunction(m_JSObject.Get(G_ISOLATE()), "OnResponse", 2, args);
			log_info("js res:%s", ret.c_str());
			delete this;
			
		}
	}*/
};
void ClearWeakHttp(
	const v8::WeakCallbackInfo<JSHttp>& data) {
	printf("clear weak is called\n");
	JSHttp *http = data.GetParameter();
	if(http)delete[] http;
	
}

void register_http_class(v8::Handle<v8::ObjectTemplate> global, v8::Isolate* isolate)
{
	Local<FunctionTemplate> http_class_template = FunctionTemplate::New(isolate, [](const FunctionCallbackInfo<Value>& args) {

		if (!args.IsConstructCall())return;
		JSHttp* obj = new JSHttp();
		Local<External> native_ptr = External::New(args.GetIsolate(), obj);
		args.This()->SetInternalField(0, native_ptr);
		
		obj->m_JSObject.Reset(args.GetIsolate(), args.This());
		obj->m_JSObject.SetWeak(obj, &ClearWeakHttp, v8::WeakCallbackType::kParameter);

	});
	Handle<ObjectTemplate> class_proto = http_class_template->PrototypeTemplate();
	reg_func(class_proto, isolate, "Get", [](const FunctionCallbackInfo<Value>& args) {
		Local<Object> self = args.This();
		Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
		void* ptr = wrap->Value();
		JSHttp* w = static_cast<JSHttp*>(ptr);
		if (w) 
		{
			String::Utf8Value url(args[0]->ToString());
			String::Utf8Value data(args[1]->ToString());
			w->Get(*url,*data);
			//gHttpManager.Get(*url, w);
		}

	});
	reg_func(class_proto, isolate, "Post", [](const FunctionCallbackInfo<Value>& args) {
		
		Local<Object> self = args.This();
		Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
		void* ptr = wrap->Value();
		JSHttp* w = static_cast<JSHttp*>(ptr);
		if (w)
		{
			String::Utf8Value url(args[0]->ToString());
			String::Utf8Value data(args[1]->ToString());
			String::Utf8Value content_type(args[2]->ToString());
			w->Post(*url, *data, *content_type);
			//gHttpManager.Post(*url, *data,*content_type,w);
			
		}
	});
	reg_func(class_proto, isolate, "Post2", [](const FunctionCallbackInfo<Value>& args) {

		Local<Object> self = args.This();
		Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
		void* ptr = wrap->Value();
		JSHttp* w = static_cast<JSHttp*>(ptr);
		if (w)
		{
			String::Utf8Value url(args[0]->ToString());
			String::Utf8Value data(args[1]->ToString());
			String::Utf8Value content_type(args[2]->ToString());
			std::string ret;
			HttpPost(*url, *data, *content_type, ret);
			//log_info("post2 ret:%s", ret.c_str());
			args.GetReturnValue().Set(String::NewFromUtf8(args.GetIsolate(), ret.c_str()));
			

		}
	});
	/*reg_func(class_proto, isolate, "Free", [](const FunctionCallbackInfo<Value>& args) {
		Local<Object> self = args.This();
		Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
		void* ptr = wrap->Value();
		JSHttp* w = static_cast<JSHttp*>(ptr);
		if (w)
		{
			args.This()->SetInternalField(0, External::New(args.GetIsolate(), NULL));
			delete w;
		}

	});*/
	http_class_template->InstanceTemplate()->SetInternalFieldCount(3);
	global->Set(String::NewFromUtf8(isolate, "Http"), http_class_template);
}
void set_js_object(Local<FunctionTemplate> &f_template, JS_OBJECT &obj)
{
	obj = Local<Object>::Cast(f_template->GetFunction()->CallAsConstructor(G_ISOLATE()->GetCurrentContext(), 0, NULL).ToLocalChecked());
}
void register_all_native()
{
	auto engine = ScriptEngine::GetInstance();
	engine->RegisterNative(register_log_class);
	engine->RegisterNative(register_server_class);
	engine->RegisterNative(register_file_helper_class);
	engine->RegisterNative(register_client_class);
	engine->RegisterNative(register_async_file_class);
	engine->RegisterNative(register_timer_class);
	engine->RegisterNative(register_http_class);
}