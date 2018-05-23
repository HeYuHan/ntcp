#pragma once
#ifndef __JAVASCRIPT_H__
#define __JAVASCRIPT_H__
typedef enum
{
	JS_BOOL=1,
	JS_STRING,
	JS_NUMBER,
	JS_FLOAT,
}JSArgype;
class JSArg
{
private:
	JSArgype m_Type;
	size_t m_NumberValue;
	float m_FloatValue;
	const char *m_StringValue;
	bool m_BoolValue;
public:
	JSArg(float f)
	{
		m_FloatValue = f;
		m_Type = JSArgype::JS_FLOAT;
	}
	JSArg(size_t t)
	{
		m_NumberValue = t;
		m_Type = JSArgype::JS_NUMBER;
	}
	JSArg(bool b)
	{
		m_BoolValue = b;
		m_Type = JSArgype::JS_BOOL;
	}
	JSArg(const char* s, size_t len)
	{
		m_StringValue = s;
		m_NumberValue = len;
		m_Type = JSArgype::JS_STRING;
	}
	JSArgype getType()
	{
		return m_Type;
	}
public:
	const char* getStringValue() { return m_StringValue; }
	size_t getNumberValue() { return m_NumberValue; }
	bool getBoolValue() { return m_BoolValue; }
	float getFloateValue() { return m_FloatValue; }
};
#ifdef V8_ENGINE

#ifdef WIN32
#pragma comment(lib,"./../lib/v8.dll.lib")
#pragma comment(lib,"./../lib/v8_libplatform.dll.lib")
#endif

#include <libplatform/libplatform.h>
#include <v8.h>

typedef void(*on_script_load_end)();
typedef void(*native_class_register_call)(v8::Handle<v8::ObjectTemplate>, v8::Isolate*);
void set_js_object(v8::Local<v8::FunctionTemplate> &f_template, v8::Handle<v8::Object> &obj);
typedef v8::Handle<v8::Object> JS_OBJECT;
typedef v8::Handle<v8::Value> JS_VALUE;
#define IS_EMPTY_OBJECT(x) x.IsEmpty()
//#define JS_OBJECT Handle<v8::Object>
#endif // V8_ENGINE
#ifdef SPIDERMONKEY_ENGINE
#include <jsapi.h>
#include "spidermonkey_specifics.h"
typedef JSObject* JS_OBJECT
typedef jsval JS_VALUE
#define IS_EMPTY_OBJECT(x) x==NULL
#endif


#endif // !__JAVASCRIPT_H__

