#include <jsapi.h>
#include "spidermonkey_specifics.h"
#include "Server.h"
#include "Client.h"
#include "js_tools.h"
#include <FileReader.h>
#include <Timer.h>
#include <HttpConnection3.h>
#include <json/json.h>
using namespace JS;

struct NativeString
{
	std::string m_Str;
	void Append(const std::string str)
	{
		this->m_Str += str;
	}
	void Append(const char* str)
	{
		this->m_Str += std::string(str);
	}
	const char* Get() {
		return m_Str.c_str();
	}
};

JSClass *jsb_Server_class;
JSObject *jsb_Server_prototype;

bool js_Server_Constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
	CallArgs args = CallArgsFromVp(argc, vp);
	if (argc == 0) {
		if (gServer.m_JSObject == NULL)
		{
			js_type_class_t *typeClass = js_get_type_from_native<Server>(&gServer);
			gServer.m_JSObject = jsb_ref_create_jsobject(cx, &gServer, typeClass, "Server");
		}
		JS::RootedObject jsret(cx, gServer.m_JSObject);
		args.rval().set(OBJECT_TO_JSVAL(jsret));
		return true;
	}
	JS_ReportError(cx, "js_Server_Create : wrong number of arguments");
	return false;
}




bool js_Server_Init(JSContext *cx, uint32_t argc, jsval *vp)
{
	JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
	bool ok = true;
	if (argc == 1)
	{
		char* json = JS_EncodeStringToUTF8(cx, JS::RootedString(cx, JS::ToString(cx, args.get(0))));
		bool ret = false;
		Json::Reader reader;
		Json::Value root;
		do 
		{
			if (!reader.parse(json, root))break;
			std::string ip = root["ip"].asString();
			int port = root["port"].asInt();
			int max_client = root["max_client"].asInt();
			ret = gServer.m_OnLineClients.Initialize(max_client);
			ret = ret && gServer.CreateTcpServer(ip.c_str(), port, max_client);
		} while (0);
		args.rval().set(BOOLEAN_TO_JSVAL(ret));
		return true;
	}
	return false;
}
bool js_Server_Loop(JSContext *cx, uint32_t argc, jsval *vp)
{
	JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
	bool ok = true;
	if (argc == 0)
	{
		args.rval().set(INT_TO_JSVAL(gServer.Loop()));
		return true;
	}
	return false;
}

//void js_character_finalize(JSFreeOp* fop, JSObject* obj);
void js_register_Server(JSContext *cx, JS::HandleObject global)
{
	jsb_Server_class = (JSClass *)calloc(1, sizeof(JSClass));
	jsb_Server_class->name = "Server";
	jsb_Server_class->addProperty = JS_PropertyStub;
	jsb_Server_class->delProperty = JS_DeletePropertyStub;
	jsb_Server_class->getProperty = JS_PropertyStub;
	jsb_Server_class->setProperty = JS_StrictPropertyStub;
	jsb_Server_class->enumerate = JS_EnumerateStub;
	jsb_Server_class->resolve = JS_ResolveStub;
	jsb_Server_class->convert = JS_ConvertStub;
	//析构
	//jsb_Server_class->finalize
	jsb_Server_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

	static JSPropertySpec properties[] = {
		JS_PS_END
	};
	static JSFunctionSpec funcs[] = {
		JS_FN("Init", js_Server_Init, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("Start", js_Server_Loop, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FS_END
	};
	static JSFunctionSpec st_funcs[] = {
		JS_FN("Get", js_Server_Constructor, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),

		JS_FS_END
	};

	//JS::RootedObject parent_proto(cx, jsb_cocos2d_Layer_prototype);
	jsb_Server_prototype = JS_InitClass(
		cx, global,
		//parent_proto,
		JS::NullPtr(),
		jsb_Server_class,
		js_Server_Constructor, 0, // constructor
		properties,
		funcs,
		NULL, // no static properties
		st_funcs);

	JS::RootedObject proto(cx, jsb_Server_prototype);
	/*JS::RootedValue className(cx, std_string_to_jsval(cx, "Server"));
	JS_SetProperty(cx, proto, "_className", className);*/
	//JS_SetProperty(cx, proto, "__nativeObj", JS::TrueHandleValue);
	//JS_SetProperty(cx, proto, "__is_ref", JS::TrueHandleValue);
	// add the proto and JSClass to the type->js info hash table
	jsb_register_class<Server>(cx, jsb_Server_class, proto, JS::NullPtr());
	
}
bool js_Log_Debug(JSContext *cx, uint32_t argc, jsval *vp)
{
	JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
	bool ok = true;
	JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
	if (argc == 1) {
		char* log=JS_EncodeStringToUTF8(cx, JS::RootedString(cx, JS::ToString(cx, args.get(0))));
		log_debug("%s", log);
		args.rval().setUndefined();
		return true;
	}

	JS_ReportError(cx, "js_Log_Debug : wrong number of arguments: %d, was expecting %d", argc, 1);
	return false;
}
bool js_Log_Constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
	return true;
}
JSClass *jsb_Log_class;
JSObject *jsb_Log_prototype;
void js_register_Log(JSContext *cx, JS::HandleObject global)
{
	jsb_Log_class = (JSClass *)calloc(1, sizeof(JSClass));
	jsb_Log_class->name = "Debug";
	jsb_Log_class->addProperty = JS_PropertyStub;
	jsb_Log_class->delProperty = JS_DeletePropertyStub;
	jsb_Log_class->getProperty = JS_PropertyStub;
	jsb_Log_class->setProperty = JS_StrictPropertyStub;
	jsb_Log_class->enumerate = JS_EnumerateStub;
	jsb_Log_class->resolve = JS_ResolveStub;
	jsb_Log_class->convert = JS_ConvertStub;
	//析构
	//jsb_Server_class->finalize
	jsb_Log_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

	static JSPropertySpec properties[] = {
		JS_PS_END
	};
	static JSFunctionSpec funcs[] = {
		JS_FS_END
	};
	static JSFunctionSpec st_funcs[] = {
		JS_FN("Log", js_Log_Debug, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FS_END
	};

	//JS::RootedObject parent_proto(cx, jsb_cocos2d_Layer_prototype);
	jsb_Log_prototype = JS_InitClass(
		cx, global,
		//parent_proto,
		JS::NullPtr(),
		jsb_Log_class,
		js_Log_Constructor, 0, // constructor
		properties,
		funcs,
		NULL, // no static properties
		st_funcs);

	JS::RootedObject proto(cx, jsb_Log_prototype);
	/*JS::RootedValue className(cx, std_string_to_jsval(cx, "Server"));
	JS_SetProperty(cx, proto, "_className", className);*/
	//JS_SetProperty(cx, proto, "__nativeObj", JS::TrueHandleValue);
	//JS_SetProperty(cx, proto, "__is_ref", JS::TrueHandleValue);
	// add the proto and JSClass to the type->js info hash table
	jsb_register_class<Logger>(cx, jsb_Log_class, proto, JS::NullPtr());

}

bool js_Client_Constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
	CallArgs args = CallArgsFromVp(argc, vp);
	if (argc == 1) {
		uint id = args.get(0).toInt32();
		Client *c = gServer.GetClient(id);
		if (c)
		{
			if (c->m_JSClient == NULL)
			{
				js_type_class_t *typeClass = js_get_type_from_native<Client>(c);
				c->m_JSClient = jsb_ref_create_jsobject(cx, c, typeClass, "Client");
			}
			
			JS::RootedObject jsret(cx, c->m_JSClient);
			args.rval().set(OBJECT_TO_JSVAL(jsret));
		}
		else
		{
			args.rval().setUndefined();
		}
		return true;
	}
	JS_ReportError(cx, "js_Server_Create : wrong number of arguments");
	return false;
}
bool js_Client_Disconnect(JSContext *cx, uint32_t argc, jsval *vp)
{
	CallArgs args = CallArgsFromVp(argc, vp);
	JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
	js_proxy_t *proxy = jsb_get_js_proxy(obj);
	Client* cobj = (Client *)(proxy ? proxy->ptr : NULL);
	if (cobj == NULL)
	{
		log_error("Client Invalid Native Object:%s",__FUNCTION__);
		return false;
	}
	if (argc == 0) {
		cobj->Disconnect();
		args.rval().setUndefined();
		return true;
	}
	JS_ReportError(cx, "js_Client_Disconnect : wrong number of arguments");
	return false;
}
bool js_Client_Send(JSContext *cx, uint32_t argc, jsval *vp)
{
	CallArgs args = CallArgsFromVp(argc, vp);
	JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
	js_proxy_t *proxy = jsb_get_js_proxy(obj);
	Client* cobj = (Client *)(proxy ? proxy->ptr : NULL);
	if (cobj == NULL)
	{
		log_error("Client Invalid Native Object:%s",__FUNCTION__);
		return false;
	}
	if (argc == 1) {
		char* msg = JS_EncodeStringToUTF8(cx, JS::RootedString(cx, JS::ToString(cx, args.get(0))));
		cobj->BeginWrite();
		cobj->WriteData(msg, strlen(msg));
		cobj->EndWrite();
		args.rval().setUndefined();
		return true;
	}
	JS_ReportError(cx, "js_Client_Send : wrong number of arguments");
	return false;
}
bool js_Client_SendNString(JSContext *cx, uint32_t argc, jsval *vp)
{
	CallArgs args = CallArgsFromVp(argc, vp);
	JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
	js_proxy_t *proxy = jsb_get_js_proxy(obj);
	Client* cobj = (Client *)(proxy ? proxy->ptr : NULL);
	if (cobj == NULL)
	{
		log_error("Client Invalid Native Object:%s",__FUNCTION__);
		return false;
	}
	if (argc == 1) {
		js_proxy_t *jsProxy;
		JS::RootedObject tmpObj(cx, args.get(0).toObjectOrNull());
		jsProxy = jsb_get_js_proxy(tmpObj);
		NativeString *arg0 = (NativeString*)(jsProxy ? jsProxy->ptr : NULL);
		if (arg0)
		{
			cobj->BeginWrite();
			cobj->WriteData(arg0->m_Str.c_str(), arg0->m_Str.size());
			cobj->EndWrite();
		}
		
		args.rval().setUndefined();
		return true;
	}
	JS_ReportError(cx, "js_Client_Send : wrong number of arguments");
	return false;
}
JSClass *jsb_Client_class;
JSObject *jsb_Client_prototype;
void js_register_Client(JSContext *cx, JS::HandleObject global)
{
	jsb_Client_class = (JSClass *)calloc(1, sizeof(JSClass));
	jsb_Client_class->name = "Client";
	jsb_Client_class->addProperty = JS_PropertyStub;
	jsb_Client_class->delProperty = JS_DeletePropertyStub;
	jsb_Client_class->getProperty = JS_PropertyStub;
	jsb_Client_class->setProperty = JS_StrictPropertyStub;
	jsb_Client_class->enumerate = JS_EnumerateStub;
	jsb_Client_class->resolve = JS_ResolveStub;
	jsb_Client_class->convert = JS_ConvertStub;
	//析构
	//jsb_Server_class->finalize
	jsb_Client_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

	static JSPropertySpec properties[] = {
		JS_PS_END
	};
	static JSFunctionSpec funcs[] = {
		JS_FN("Disconnect", js_Client_Disconnect, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("Send", js_Client_Send, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("SendNString", js_Client_SendNString, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FS_END
	};
	static JSFunctionSpec st_funcs[] = {
		JS_FN("Get", js_Client_Constructor, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FS_END
	};

	//JS::RootedObject parent_proto(cx, jsb_cocos2d_Layer_prototype);
	jsb_Client_prototype = JS_InitClass(
		cx, global,
		//parent_proto,
		JS::NullPtr(),
		jsb_Client_class,
		js_Client_Constructor, 1, // constructor
		properties,
		funcs,
		NULL, // no static properties
		st_funcs);

	JS::RootedObject proto(cx, jsb_Client_prototype);
	/*JS::RootedValue className(cx, std_string_to_jsval(cx, "Server"));
	JS_SetProperty(cx, proto, "_className", className);*/
	//JS_SetProperty(cx, proto, "__nativeObj", JS::TrueHandleValue);
	//JS_SetProperty(cx, proto, "__is_ref", JS::TrueHandleValue);
	// add the proto and JSClass to the type->js info hash table
	jsb_register_class<Client>(cx, jsb_Client_class, proto, JS::NullPtr());

}
bool js_File_Read(JSContext *cx, uint32_t argc, jsval *vp)
{
	CallArgs args = CallArgsFromVp(argc, vp);
	if (argc == 1) {
		const char* path = JS_EncodeStringToUTF8(cx, JS::RootedString(cx, JS::ToString(cx, args.get(0))));
		std::string ret;
		bool ok = ReadText(ret, path);
		if (ok)
		{
			JS::RootedValue jsret(cx);
			jsret = std_string_to_jsval(cx, ret.c_str());
			args.rval().set(jsret);
		}
		else
		{
			args.rval().setUndefined();
		}
		return true;
	}
	JS_ReportError(cx, "js_File_Read : wrong number of arguments");
	return false;
}
bool js_File_Write(JSContext *cx, uint32_t argc, jsval *vp)
{
	CallArgs args = CallArgsFromVp(argc, vp);
	if (argc == 2) {
		const char* path = JS_EncodeStringToUTF8(cx, JS::RootedString(cx, JS::ToString(cx, args.get(0))));
		const char* content = JS_EncodeStringToUTF8(cx, JS::RootedString(cx, JS::ToString(cx, args.get(1))));
		std::string ret;
		bool ok = WriteText(content, path);
		JS::RootedValue jsret(cx);
		jsret = BOOLEAN_TO_JSVAL(ok);
		args.rval().set(jsret);
		return true;
	}
	JS_ReportError(cx, "js_File_Write : wrong number of arguments");
	return false;
}
bool js_File_LoadScript(JSContext *cx, uint32_t argc, jsval *vp)
{
	CallArgs args = CallArgsFromVp(argc, vp);
	if (argc == 1) {
		const char* path = JS_EncodeStringToUTF8(cx, JS::RootedString(cx, JS::ToString(cx, args.get(0))));
		bool ok = ScriptingCore::GetInstance()->RunScript(path);
		JS::RootedValue jsret(cx);
		jsret = BOOLEAN_TO_JSVAL(ok);
		args.rval().set(jsret);
		return true;
	}
	JS_ReportError(cx, "js_File_LoadScript : wrong number of arguments");
	return false;
}
bool js_File_Constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
	return false;
}
class JSFile {};
JSClass *jsb_File_class;
JSObject *jsb_File_prototype;
void js_register_File(JSContext *cx, JS::HandleObject global)
{
	jsb_File_class = (JSClass *)calloc(1, sizeof(JSClass));
	jsb_File_class->name = "FileHelper";
	jsb_File_class->addProperty = JS_PropertyStub;
	jsb_File_class->delProperty = JS_DeletePropertyStub;
	jsb_File_class->getProperty = JS_PropertyStub;
	jsb_File_class->setProperty = JS_StrictPropertyStub;
	jsb_File_class->enumerate = JS_EnumerateStub;
	jsb_File_class->resolve = JS_ResolveStub;
	jsb_File_class->convert = JS_ConvertStub;
	//析构
	//jsb_Server_class->finalize
	jsb_File_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

	static JSPropertySpec properties[] = {
		JS_PS_END
	};
	static JSFunctionSpec funcs[] = {
		JS_FS_END
	};
	static JSFunctionSpec st_funcs[] = {
		JS_FN("LoadScript", js_File_LoadScript, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("Read", js_File_Read, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("Write", js_File_Write, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FS_END
	};

	//JS::RootedObject parent_proto(cx, jsb_cocos2d_Layer_prototype);
	jsb_File_prototype = JS_InitClass(
		cx, global,
		//parent_proto,
		JS::NullPtr(),
		jsb_File_class,
		js_File_Constructor, 0, // constructor
		properties,
		funcs,
		NULL, // no static properties
		st_funcs);

	JS::RootedObject proto(cx, jsb_File_prototype);
	/*JS::RootedValue className(cx, std_string_to_jsval(cx, "Server"));
	JS_SetProperty(cx, proto, "_className", className);*/
	//JS_SetProperty(cx, proto, "__nativeObj", JS::TrueHandleValue);
	//JS_SetProperty(cx, proto, "__is_ref", JS::TrueHandleValue);
	// add the proto and JSClass to the type->js info hash table
	jsb_register_class<JSFile>(cx, jsb_File_class, proto, JS::NullPtr());
}

struct JSTimer {
	Timer m_Timer;
	JSObject* m_JSObject;
};
void js_Timer_Update(float t, void* arg)
{
	JSTimer *js_timer = static_cast<JSTimer*>(arg);
	if (js_timer&&js_timer->m_JSObject)
	{
		jsval time = DOUBLE_TO_JSVAL(t);
		ScriptingCore::GetInstance()->CallFunction(OBJECT_TO_JSVAL(js_timer->m_JSObject), "OnUpdate", JS::HandleValueArray::fromMarkedLocation(1, &time));
	}
}
void js_Timer_finalize(JSFreeOp *fop, JSObject *obj)
{
	js_proxy_t* nproxy;
	js_proxy_t* jsproxy;
	JSContext *cx = ScriptingCore::GetInstance()->GetGlobalContext();
	JS::RootedObject jsobj(cx, obj);
	jsproxy = jsb_get_js_proxy(jsobj);
	if (jsproxy) {
		JSTimer *nobj = static_cast<JSTimer *>(jsproxy->ptr);
		nobj->m_Timer.Stop();
		nproxy = jsb_get_native_proxy(jsproxy->ptr);
		
		if (nobj) {
			jsb_remove_proxy(nproxy, jsproxy);
			JS::RootedValue flagValue(cx);
			if (flagValue.isNullOrUndefined()) {
				delete nobj;
			}
		}
		else
			jsb_remove_proxy(nullptr, jsproxy);
	}
}
bool js_Timer_Constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
	JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
	if (argc == 2)
	{

		JSTimer* cobj = new (std::nothrow) JSTimer();
		
		float t = args.get(0).toNumber();
		bool loop = args.get(1).toBoolean();
		cobj->m_Timer.Init(t, js_Timer_Update, cobj, loop);
		js_type_class_t *typeClass = js_get_type_from_native<JSTimer>(cobj);
		JSObject* object = jsb_ref_create_jsobject(cx, cobj, typeClass, "Timer");
		cobj->m_JSObject = object;
		// link the native object with the javascript object
		JS::RootedObject jsobj(cx, object);
		args.rval().set(OBJECT_TO_JSVAL(jsobj));
		return true;
	}
	JS_ReportError(cx, "js_Timer_Constructor : wrong number of arguments");
	return false;
	
}
bool js_Timer_Begin(JSContext *cx, uint32_t argc, jsval *vp)
{
	JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
	JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
	js_proxy_t *proxy = jsb_get_js_proxy(obj);
	JSTimer* cobj = (JSTimer*)(proxy ? proxy->ptr : NULL);
	if (argc == 0) {
		cobj->m_Timer.Begin();
		args.rval().setUndefined();
		return true;
	}

	JS_ReportError(cx, "js_Timer_Begin : wrong number of arguments: %d, was expecting %d", argc, 0);
	return true;
}
bool js_Timer_Stop(JSContext *cx, uint32_t argc, jsval *vp)
{
	JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
	JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
	js_proxy_t *proxy = jsb_get_js_proxy(obj);
	JSTimer* cobj = (JSTimer*)(proxy ? proxy->ptr : NULL);
	if (argc == 0) {
		cobj->m_Timer.Stop();
		args.rval().setUndefined();
		return true;
	}

	JS_ReportError(cx, "js_Timer_Stop : wrong number of arguments: %d, was expecting %d", argc, 0);
	return true;
}

JSClass *jsb_Timer_class;
JSObject *jsb_Timer_prototype;
void js_register_Timer(JSContext *cx, JS::HandleObject global)
{
	jsb_Timer_class = (JSClass *)calloc(1, sizeof(JSClass));
	jsb_Timer_class->name = "Timer";
	jsb_Timer_class->addProperty = JS_PropertyStub;
	jsb_Timer_class->delProperty = JS_DeletePropertyStub;
	jsb_Timer_class->getProperty = JS_PropertyStub;
	jsb_Timer_class->setProperty = JS_StrictPropertyStub;
	jsb_Timer_class->enumerate = JS_EnumerateStub;
	jsb_Timer_class->resolve = JS_ResolveStub;
	jsb_Timer_class->convert = JS_ConvertStub;
	//析构
	jsb_Timer_class->finalize = js_Timer_finalize;
	jsb_Timer_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

	static JSPropertySpec properties[] = {
		JS_PS_END
	};
	static JSFunctionSpec funcs[] = {
		JS_FN("Begin", js_Timer_Begin, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("Stop", js_Timer_Stop, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FS_END
	};
	static JSFunctionSpec st_funcs[] = {
		JS_FS_END
	};

	//JS::RootedObject parent_proto(cx, jsb_cocos2d_Layer_prototype);
	jsb_Timer_prototype = JS_InitClass(
		cx, global,
		//parent_proto,
		JS::NullPtr(),
		jsb_Timer_class,
		js_Timer_Constructor, 0, // constructor
		properties,
		funcs,
		NULL, // no static properties
		st_funcs);

	JS::RootedObject proto(cx, jsb_Timer_prototype);
	/*JS::RootedValue className(cx, std_string_to_jsval(cx, "Server"));
	JS_SetProperty(cx, proto, "_className", className);*/
	//JS_SetProperty(cx, proto, "__nativeObj", JS::TrueHandleValue);
	//JS_SetProperty(cx, proto, "__is_ref", JS::TrueHandleValue);
	// add the proto and JSClass to the type->js info hash table
	jsb_register_class<JSTimer>(cx, jsb_Timer_class, proto, JS::NullPtr());
}
class JSHttp :public IHttpInterface
{
public:
	JSObject* m_JSObject;
public:
	virtual void OnResponse() {
		int state = GetState();
		char msg[1024+1] = { 0 };
		std::string ret;
		int count = 0;
		do {
			if(state>0)count = ReadBuffer(msg, 1024);
			msg[count] = 0;
			if(count>0)ret += std::string(msg);
		} while (count > 0);
		if (m_JSObject)
		{
			ScriptingCore* engine = ScriptingCore::GetInstance();
			//auto _global = engine->GetGlobalObject();
			JSContext* _cx = engine->GetGlobalContext();
			JS::RootedObject obj(_cx, m_JSObject);
			JSAutoCompartment ac4(_cx, obj);
			jsval arg[2];
			arg[0] = INT_TO_JSVAL(state);
			arg[1] = STRING_TO_JSVAL(JS_NewStringCopyZ(_cx, ret.c_str()));
			engine->CallFunction(OBJECT_TO_JSVAL(m_JSObject), "OnResponse", JS::HandleValueArray::fromMarkedLocation(2, arg));
		}
	}
};

void js_Http_finalize(JSFreeOp *fop, JSObject *obj)
{
	js_proxy_t* nproxy;
	js_proxy_t* jsproxy;
	JSContext *cx = ScriptingCore::GetInstance()->GetGlobalContext();
	JS::RootedObject jsobj(cx, obj);
	jsproxy = jsb_get_js_proxy(jsobj);
	if (jsproxy) {
		JSHttp *nobj = static_cast<JSHttp *>(jsproxy->ptr);
		nproxy = jsb_get_native_proxy(jsproxy->ptr);

		if (nobj) {
			jsb_remove_proxy(nproxy, jsproxy);
			JS::RootedValue flagValue(cx);
			if (flagValue.isNullOrUndefined()) {
				delete nobj;
			}
		}
		else
			jsb_remove_proxy(nullptr, jsproxy);
	}
}
bool js_Http_Constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
	JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
	if (argc == 0)
	{

		JSHttp* cobj = new (std::nothrow) JSHttp();
		js_type_class_t *typeClass = js_get_type_from_native<JSHttp>(cobj);
		JSObject* object = jsb_ref_create_jsobject(cx, cobj, typeClass, "Http");
		cobj->m_JSObject = object;
		// link the native object with the javascript object
		JS::RootedObject jsobj(cx, object);
		args.rval().set(OBJECT_TO_JSVAL(jsobj));
		return true;
	}
	JS_ReportError(cx, "js_Http_Constructor : wrong number of arguments");
	return false;

}
bool js_Http_Get(JSContext *cx, uint32_t argc, jsval *vp)
{
	JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
	JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
	js_proxy_t *proxy = jsb_get_js_proxy(obj);
	JSHttp* cobj = (JSHttp*)(proxy ? proxy->ptr : NULL);
	if (argc == 1) {
		const char* url = JS_EncodeStringToUTF8(cx, JS::RootedString(cx, JS::ToString(cx, args.get(0))));
		bool ok = gHttpManager.Get(url, cobj);
		args.rval().set(BOOLEAN_TO_JSVAL(ok));
		return true;
	}

	JS_ReportError(cx, "js_Http_Get : wrong number of arguments: %d, was expecting %d", argc, 0);
	return true;
}
bool js_Http_Post(JSContext *cx, uint32_t argc, jsval *vp)
{
	JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
	JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
	js_proxy_t *proxy = jsb_get_js_proxy(obj);
	JSHttp* cobj = (JSHttp*)(proxy ? proxy->ptr : NULL);
	if (argc == 2) {
		const char* url = JS_EncodeStringToUTF8(cx, JS::RootedString(cx, JS::ToString(cx, args.get(0))));
		const char* data = JS_EncodeStringToUTF8(cx, JS::RootedString(cx, JS::ToString(cx, args.get(1))));
		bool ok = gHttpManager.Post(url,data,cobj);
		args.rval().set(BOOLEAN_TO_JSVAL(ok));
		return true;
	}

	JS_ReportError(cx, "js_Http_Post : wrong number of arguments: %d, was expecting %d", argc, 0);
	return true;
}
JSClass *jsb_Http_class;
JSObject *jsb_Http_prototype;

void js_register_Http(JSContext *cx, JS::HandleObject global)
{
	jsb_Http_class = (JSClass *)calloc(1, sizeof(JSClass));
	jsb_Http_class->name = "Http";
	jsb_Http_class->addProperty = JS_PropertyStub;
	jsb_Http_class->delProperty = JS_DeletePropertyStub;
	jsb_Http_class->getProperty = JS_PropertyStub;
	jsb_Http_class->setProperty = JS_StrictPropertyStub;
	jsb_Http_class->enumerate = JS_EnumerateStub;
	jsb_Http_class->resolve = JS_ResolveStub;
	jsb_Http_class->convert = JS_ConvertStub;
	//析构
	jsb_Http_class->finalize = js_Http_finalize;
	jsb_Http_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

	static JSPropertySpec properties[] = {
		JS_PS_END
	};
	static JSFunctionSpec funcs[] = {
		JS_FN("Get", js_Http_Get, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("Post", js_Http_Post, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FS_END
	};
	static JSFunctionSpec st_funcs[] = {
		JS_FS_END
	};

	//JS::RootedObject parent_proto(cx, jsb_cocos2d_Layer_prototype);
	jsb_Http_prototype = JS_InitClass(
		cx, global,
		//parent_proto,
		JS::NullPtr(),
		jsb_Http_class,
		js_Http_Constructor, 0, // constructor
		properties,
		funcs,
		NULL, // no static properties
		st_funcs);

	JS::RootedObject proto(cx, jsb_Http_prototype);
	/*JS::RootedValue className(cx, std_string_to_jsval(cx, "Server"));
	JS_SetProperty(cx, proto, "_className", className);*/
	//JS_SetProperty(cx, proto, "__nativeObj", JS::TrueHandleValue);
	//JS_SetProperty(cx, proto, "__is_ref", JS::TrueHandleValue);
	// add the proto and JSClass to the type->js info hash table
	jsb_register_class<JSHttp>(cx, jsb_Http_class, proto, JS::NullPtr());
}

void js_String_finalize(JSFreeOp *fop, JSObject *obj)
{
	js_proxy_t* nproxy;
	js_proxy_t* jsproxy;
	JSContext *cx = ScriptingCore::GetInstance()->GetGlobalContext();
	JS::RootedObject jsobj(cx, obj);
	jsproxy = jsb_get_js_proxy(jsobj);
	if (jsproxy) {
		NativeString *nobj = static_cast<NativeString *>(jsproxy->ptr);
		nproxy = jsb_get_native_proxy(jsproxy->ptr);

		if (nobj) {
			jsb_remove_proxy(nproxy, jsproxy);
			JS::RootedValue flagValue(cx);
			if (flagValue.isNullOrUndefined()) {
				delete nobj;
			}
		}
		else
			jsb_remove_proxy(nullptr, jsproxy);
	}
}
bool js_String_Constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
	JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
	if (argc == 0)
	{
		NativeString* cobj = new (std::nothrow) NativeString();

		js_type_class_t *typeClass = js_get_type_from_native<NativeString>(cobj);
		JSObject* object = jsb_ref_create_jsobject(cx, cobj, typeClass, "NativeString");
		// link the native object with the javascript object
		JS::RootedObject jsobj(cx, object);
		args.rval().set(OBJECT_TO_JSVAL(jsobj));
		return true;
	}
	JS_ReportError(cx, "js_String_Constructor : wrong number of arguments");
	return false;

}
bool js_String_Get(JSContext *cx, uint32_t argc, jsval *vp)
{
	JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
	JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
	js_proxy_t *proxy = jsb_get_js_proxy(obj);
	NativeString* cobj = (NativeString*)(proxy ? proxy->ptr : NULL);
	if (argc == 0) {
		JS::RootedValue jsret(cx);
		jsret = STRING_TO_JSVAL(JS_NewStringCopyZ(cx, cobj->Get()));
		args.rval().set(jsret);
		return true;
	}

	JS_ReportError(cx, "js_Strin_Get : wrong number of arguments: %d, was expecting %d", argc, 0);
	return true;
}
bool js_String_Append(JSContext *cx, uint32_t argc, jsval *vp)
{
	JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
	JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
	js_proxy_t *proxy = jsb_get_js_proxy(obj);
	NativeString* cobj = (NativeString*)(proxy ? proxy->ptr : NULL);
	if (argc == 1) {
		const char* data = JS_EncodeStringToUTF8(cx, JS::RootedString(cx, JS::ToString(cx, args.get(0))));
		cobj->Append(data);
		args.rval().setUndefined();
		return true;
	}

	JS_ReportError(cx, "js_String_Append : wrong number of arguments: %d, was expecting %d", argc, 0);
	return true;
}
JSClass *jsb_String_class;
JSObject *jsb_String_prototype;
void js_register_String(JSContext *cx, JS::HandleObject global)
{
	jsb_String_class = (JSClass *)calloc(1, sizeof(JSClass));
	jsb_String_class->name = "NString";
	jsb_String_class->addProperty = JS_PropertyStub;
	jsb_String_class->delProperty = JS_DeletePropertyStub;
	jsb_String_class->getProperty = JS_PropertyStub;
	jsb_String_class->setProperty = JS_StrictPropertyStub;
	jsb_String_class->enumerate = JS_EnumerateStub;
	jsb_String_class->resolve = JS_ResolveStub;
	jsb_String_class->convert = JS_ConvertStub;
	//析构
	jsb_String_class->finalize = js_String_finalize;
	jsb_String_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

	static JSPropertySpec properties[] = {
		JS_PS_END
	};
	static JSFunctionSpec funcs[] = {
		JS_FN("Append", js_String_Append, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("Get", js_String_Get, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FS_END
	};
	static JSFunctionSpec st_funcs[] = {
		JS_FS_END
	};

	//JS::RootedObject parent_proto(cx, jsb_cocos2d_Layer_prototype);
	jsb_String_prototype = JS_InitClass(
		cx, global,
		//parent_proto,
		JS::NullPtr(),
		jsb_String_class,
		js_String_Constructor, 0, // constructor
		properties,
		funcs,
		NULL, // no static properties
		st_funcs);

	JS::RootedObject proto(cx, jsb_String_prototype);
	/*JS::RootedValue className(cx, std_string_to_jsval(cx, "Server"));
	JS_SetProperty(cx, proto, "_className", className);*/
	//JS_SetProperty(cx, proto, "__nativeObj", JS::TrueHandleValue);
	//JS_SetProperty(cx, proto, "__is_ref", JS::TrueHandleValue);
	// add the proto and JSClass to the type->js info hash table
	jsb_register_class<NativeString>(cx, jsb_String_class, proto, JS::NullPtr());
}