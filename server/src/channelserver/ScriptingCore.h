#pragma once
#ifndef __SCRIPT_ENGINE_H__
#define __SCRIPT_ENGINE_H__
#include "javascript.h"

class ScriptEngine
{
public:
	~ScriptEngine();
	static ScriptEngine* GetInstance();
	bool Start();
	void Stop();
	void RegisterNative(native_class_register_call call);
	void RegisterOnScriptLoaded(on_script_load_end call);
	bool ReadScriptFile(const char* path);
	void Eval(const char* str, const char* fileName = 0);
	bool CallFunction(JS_OBJECT obj, const char* name,int argc, JSArg *args, JS_VALUE &ret);
	bool CallFunction(JS_OBJECT obj, const char* name, int argc, JSArg *args);
	bool CallFunction(JS_OBJECT obj, const char* name);
	bool CallGlobalFunction(const char* name, int argc, JSArg *args, JS_VALUE &ret);
	bool CallGlobalFunction(const char* name, int argc, JSArg *args);
	bool CallGlobalFunction(const char* name);
	JS_OBJECT NewObject();
	v8::Isolate* GetIsolate() { return m_Isolate; }
private:
	ScriptEngine();
	v8::Isolate* m_Isolate;
	v8::Handle<v8::ObjectTemplate> m_GlobalObject;
	v8::Isolate::CreateParams m_CreateParams;
	v8::Local<v8::Context> m_Context;
};

extern char* V8_BIN_PATH;

#endif
