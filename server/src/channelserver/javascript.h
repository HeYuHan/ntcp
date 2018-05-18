#pragma once
#ifndef __JAVASCRIPT_H__
#define __JAVASCRIPT_H__
#ifdef V8_ENGINE

#ifdef WIN32
#pragma comment(lib,"./../lib/v8.dll.lib")
#pragma comment(lib,"./../lib/v8_libplatform.dll.lib")
#endif
#include <libplatform/libplatform.h>
#include <v8.h>
typedef void(*native_class_register_call)(v8::Handle<v8::ObjectTemplate>, v8::Isolate*);
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

