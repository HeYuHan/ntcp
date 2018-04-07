#pragma once
#ifndef __JSB_H__
#define __JSB_H__
#include <jsapi.h>
void js_register_Log(JSContext *cx, JS::HandleObject global);
void js_register_Server(JSContext *cx, JS::HandleObject global);
void js_register_Client(JSContext *cx, JS::HandleObject global);
void js_register_File(JSContext *cx, JS::HandleObject global);
void js_register_Timer(JSContext *cx, JS::HandleObject global);
void js_register_Http(JSContext *cx, JS::HandleObject global);
void js_register_String(JSContext *cx, JS::HandleObject global);
void js_register_AsyncFile(JSContext *cx, JS::HandleObject global);
#endif // !__JSB_H__
