#include <jsapi.h>
#include "spidermonkey_specifics.h"
#include "Server.h"
#include "Client.h"
#include "js_tools.h"
#include <FileReader.h>
#include <Timer.h>
#include <HttpConnection3.h>
#include <json/json.h>
#include <ccUTF8.h>


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
		std::string data;
		GetJSUTF8String(cx, args.get(0), data);
		bool ret = false;
		Json::Reader reader;
		Json::Value root;
		do 
		{
			if (!reader.parse(data, root))break;
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
			log_debug("create server in %s max_client %d", addr.c_str(),max_client);
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
bool js_Server_Platfrom(JSContext *cx, uint32_t argc, jsval *vp)
{
	JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
	bool ok = true;
	if (argc == 0)
	{
#ifdef WIN32
		int p = 1;
#else
		int p = 2;
#endif // WIN32

		args.rval().set(INT_TO_JSVAL(p));
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
		JS_FN("Platfrom", js_Server_Platfrom, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
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
bool js_Log(JSContext *cx, uint32_t argc, jsval *vp)
{
	JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
	bool ok = true;
	JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
	if(argc == 2)
	{
		int id = args.get(0).toInt32();

		std::string data;
		GetJSUTF8String(cx, args.get(1), data);
		if (id == 1)log_debug("%s", data.c_str());
		if (id == 2)log_warn("%s", data.c_str());
		if (id == 3)log_error("%s", data.c_str());
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
		JS_FN("Log", js_Log, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
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
		std::string msg;
		GetJSUTF8String(cx, args.get(0), msg);
		cobj->BeginWrite();
		cobj->WriteData(msg.c_str(), msg.size());
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
		std::string path;
		GetJSUTF8String(cx, args.get(0), path);
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
		std::string path;
		GetJSUTF8String(cx, args.get(0), path);
		std::string content;
		GetJSUTF8String(cx, args.get(1), content);
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
		std::string path;
		GetJSUTF8String(cx, args.get(0), path);
		bool ok = ScriptingCore::GetInstance()->RunScript(path.c_str());
		JS::RootedValue jsret(cx);
		jsret = BOOLEAN_TO_JSVAL(ok);
		args.rval().set(jsret);
		log_debug("load script %s ret:%d", path.c_str(), ok);
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
bool js_AsyncFile_Constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
	return false;
}
bool js_AsyncFile_Get(JSContext *cx, uint32_t argc, jsval *vp)
{
	CallArgs args = CallArgsFromVp(argc, vp);
	if (argc == 1) {
		std::string path;
		GetJSUTF8String(cx, args.get(0), path);
		AsyncFileWriter* w = gServer.m_FileWriters.Allocate();
		if (w)
		{
			if (w->Create(path))
			{
				args.rval().set(UINT_TO_JSVAL(w->uid));
			}
			else
			{
				log_error("crate file handle error:%s", path.c_str());
				args.rval().set(UINT_TO_JSVAL(0));
			}
		}
		else
		{
			log_error("%s", "get file writer error");
			args.rval().setUndefined();
		}
		return true;
	}
	JS_ReportError(cx, "js_AsyncFile_Get : wrong number of arguments");
	return false;
}

bool js_AsyncFile_Write(JSContext *cx, uint32_t argc, jsval *vp)
{
	CallArgs args = CallArgsFromVp(argc, vp);
	if (argc == 2) {
		uint id = (uint)args.get(0).toInt32();
		AsyncFileWriter* w = gServer.m_FileWriters.Get(id);

		std::string content;
		GetJSUTF8String(cx, args.get(1), content);
		if (w)
		{
			w->PushContent(content.c_str());
			args.rval().setBoolean(true);
		}
		else
		{
			log_error("%s", "get file writer error");
			args.rval().setBoolean(false);
		}
		return true;
	}
	JS_ReportError(cx, "js_AsyncFile_Write : wrong number of arguments");
	return false;
}
bool js_AsyncFile_WriteNString(JSContext *cx, uint32_t argc, jsval *vp)
{
	CallArgs args = CallArgsFromVp(argc, vp);
	if (argc == 2) {
		uint id = (uint)args.get(0).toInt32();
		AsyncFileWriter* w = gServer.m_FileWriters.Get(id);

		js_proxy_t *jsProxy;
		JS::RootedObject tmpObj(cx, args.get(1).toObjectOrNull());
		jsProxy = jsb_get_js_proxy(tmpObj);
		NativeString *content = (NativeString*)(jsProxy ? jsProxy->ptr : NULL);
		if (w && content)
		{
			w->PushContent(content->Get());
			args.rval().setBoolean(true);
		}
		else
		{
			log_error("%s", "get file writer error");
			args.rval().setBoolean(false);
		}
		return true;
	}
	JS_ReportError(cx, "js_AsyncFile_Write : wrong number of arguments");
	return false;
}

bool js_AsyncFile_Free(JSContext *cx, uint32_t argc, jsval *vp)
{
	CallArgs args = CallArgsFromVp(argc, vp);
	if (argc == 1) {
		uint id = (uint)args.get(0).toInt32();
		AsyncFileWriter* w = gServer.m_FileWriters.Get(id);
		if (w)
		{
			w->Close();
			gServer.m_FileWriters.Free(id);
			args.rval().setBoolean(true);
		}
		else
		{
			log_error("%s", "get file writer error");
			args.rval().setBoolean(false);
		}
		return true;
	}
	JS_ReportError(cx, "js_AsyncFile_Free : wrong number of arguments");
	return false;
}
class JSAsyncFile {};
JSClass *jsb_AsyncFile_class;
JSObject *jsb_AsyncFile_prototype;
void js_register_AsyncFile(JSContext *cx, JS::HandleObject global)
{
	jsb_AsyncFile_class = (JSClass *)calloc(1, sizeof(JSClass));
	jsb_AsyncFile_class->name = "AsyncWriter";
	jsb_AsyncFile_class->addProperty = JS_PropertyStub;
	jsb_AsyncFile_class->delProperty = JS_DeletePropertyStub;
	jsb_AsyncFile_class->getProperty = JS_PropertyStub;
	jsb_AsyncFile_class->setProperty = JS_StrictPropertyStub;
	jsb_AsyncFile_class->enumerate = JS_EnumerateStub;
	jsb_AsyncFile_class->resolve = JS_ResolveStub;
	jsb_AsyncFile_class->convert = JS_ConvertStub;
	//析构
	//jsb_Server_class->finalize
	jsb_AsyncFile_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

	static JSPropertySpec properties[] = {
		JS_PS_END
	};
	static JSFunctionSpec funcs[] = {
		
		JS_FS_END
	};
	static JSFunctionSpec st_funcs[] = {
		JS_FN("Get", js_AsyncFile_Get, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("Write", js_AsyncFile_Write, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("WriteNString", js_AsyncFile_WriteNString, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FN("Free", js_AsyncFile_Free, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
		JS_FS_END
	};

	//JS::RootedObject parent_proto(cx, jsb_cocos2d_Layer_prototype);
	jsb_AsyncFile_prototype = JS_InitClass(
		cx, global,
		//parent_proto,
		JS::NullPtr(),
		jsb_AsyncFile_class,
		js_AsyncFile_Constructor, 0, // constructor
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
	jsb_register_class<JSAsyncFile>(cx, jsb_AsyncFile_class, proto, JS::NullPtr());
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
		std::string url;
		GetJSUTF8String(cx, args.get(0),url);
		bool ok = gHttpManager.Get(url.c_str(), cobj);
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
	if (argc == 3) {
		std::string url;
		std::string data;
		std::string content_type;
		GetJSUTF8String(cx, args.get(0),url);
		GetJSUTF8String(cx, args.get(1),data);
		GetJSUTF8String(cx, args.get(2), content_type);
		bool ok = gHttpManager.Post(url.c_str(),data.c_str(),content_type.c_str(),cobj);
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
		JS_FN("Post", js_Http_Post, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
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
		std::string data;
		GetJSUTF8String(cx, args.get(0), data);
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