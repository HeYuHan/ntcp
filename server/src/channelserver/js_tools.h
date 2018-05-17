#pragma once
#ifndef __JS_TOOLS_H__
#define __JS_TOOLS_H__
#include <jsapi.h>
#include <string>
#include "spidermonkey_specifics.h"
class JSStringWrapper
{
public:
	JSStringWrapper();
	JSStringWrapper(JS::HandleString str, JSContext* cx = nullptr);
	JSStringWrapper(JS::HandleValue val, JSContext* cx = nullptr);
	~JSStringWrapper();

	void set(JS::HandleValue val, JSContext* cx);
	void set(JS::HandleString str, JSContext* cx);
	const char* get();

private:
	const char* _buffer;
};

void GetJSUTF8String(JSContext *cx, JS::HandleValue str, std::string &ret);
void GetJSString(JSContext *cx, JS::HandleValue str, std::string &ret);
bool js_utf8_to_utf16(std::string &utf8, std::string &retStr);
jsval std_string_to_jsval(JSContext* cx, const std::string& v);
jsval c_string_to_jsval(JSContext* cx, const char* v, size_t length=-1);
JSObject* jsb_ref_create_jsobject(JSContext *cx, void *ref, js_type_class_t *typeClass, const char* debug,bool create_proxy=true);
typedef void(*sc_register_sth)(JSContext* cx, JS::HandleObject global);
js_proxy_t* jsb_new_proxy(void* nativeObj, JS::HandleObject jsHandle);
js_proxy_t* jsb_get_native_proxy(void* nativeObj);
js_proxy_t* jsb_get_js_proxy(JS::HandleObject jsObj);
void jsb_remove_proxy(js_proxy_t* nativeProxy, js_proxy_t* jsProxy);
void jsb_remove_proxy(js_proxy_t* proxy);

template <class T>
js_type_class_t *jsb_register_class(JSContext *cx, JSClass *jsClass, JS::HandleObject proto, JS::HandleObject parentProto)
{
	js_type_class_t *p = nullptr;
	std::string typeName = TypeTest<T>::s_name();
	if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
	{
		JS::RootedObject protoRoot(cx, proto);
		JS::RootedObject protoParentRoot(cx, parentProto);
		p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
		memset(p, 0, sizeof(js_type_class_t));
		p->jsclass = jsClass;
		auto persistentProtoRoot = new (std::nothrow) JS::PersistentRootedObject(cx, protoRoot);
		p->proto.set(persistentProtoRoot);

		auto persistentProtoParentRoot = new (std::nothrow) JS::PersistentRootedObject(cx, protoParentRoot);
		p->parentProto.set(persistentProtoParentRoot);
		_js_global_type_map.insert(std::make_pair(typeName, p));
	}
	return p;
}

template <class T>
inline js_type_class_t *js_get_type_from_native(T* native_obj) {
	bool found = false;
	std::string typeName = typeid(*native_obj).name();
	auto typeProxyIter = _js_global_type_map.find(typeName);
	if (typeProxyIter == _js_global_type_map.end())
	{
		typeName = typeid(T).name();
		typeProxyIter = _js_global_type_map.find(typeName);
		if (typeProxyIter != _js_global_type_map.end())
		{
			found = true;
		}
	}
	else
	{
		found = true;
	}
	return found ? typeProxyIter->second : nullptr;
}


class ScriptingCore
{
public:
	ScriptingCore();
	~ScriptingCore();
public:
	static ScriptingCore* GetInstance();
	bool Start();
	void Stop();
	bool RunScript(const char* path);
	bool Eval(const char* script,JS::RootedValue &ret);
	bool Eval(const char* script);
	bool CallFunction(jsval owner, const char *name, uint32_t argc, jsval *vp, JS::MutableHandleValue retVal);
	bool CallFunction(jsval owner, const char *name, const JS::HandleValueArray& args, JS::MutableHandleValue retVal);
	bool CallFunction(jsval owner, const char *name, const JS::HandleValueArray& args);
	bool CallFunction(jsval owner, const char *name);
	bool CallGlobalFunction(const char* name, const JS::HandleValueArray& args, JS::MutableHandleValue retVal);
	bool CallGlobalFunction(const char* name);
	void GC();
	void RemoveObjectProxy(void* obj);
	JSObject* GetGlobalObject();
	JSContext* GetGlobalContext();
	void RegisterJSClass(sc_register_sth call);
private:
	JS::PersistentRootedObject *_global;
	JSContext *_cx;
	JSRuntime *_rt;
};

#endif // !__JS_TOOLS__
