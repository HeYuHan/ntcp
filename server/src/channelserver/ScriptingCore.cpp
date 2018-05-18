#include "ScriptingCore.h"
#include "FileReader.h"
#include <string.h>
#include <log.h>
ScriptEngine * m_SharedInstance = NULL;
ScriptEngine::ScriptEngine():m_Isolate(NULL)
{
}

ScriptEngine::~ScriptEngine()
{
}

ScriptEngine* ScriptEngine::GetInstance()
{
	if (m_SharedInstance == NULL) {
		m_SharedInstance = new ScriptEngine();
	}
	return m_SharedInstance;

}
#ifdef V8_ENGINE
using namespace v8;
static std::vector<native_class_register_call> registrationList;
bool ScriptEngine::Start(const char* arg)
{
	v8::V8::InitializeICUDefaultLocation(arg);
	v8::V8::InitializeExternalStartupData(arg);
	std::unique_ptr<v8::Platform> platform = v8::platform::NewDefaultPlatform();
	v8::V8::InitializePlatform(platform.get());
	v8::V8::Initialize();

	// Create a new Isolate and make it the current one.
	m_CreateParams.array_buffer_allocator =
		v8::ArrayBuffer::Allocator::NewDefaultAllocator();

	m_Isolate=v8::Isolate::New(m_CreateParams);

	v8::Isolate::Scope isolate_scope(m_Isolate);
	v8::HandleScope handle_scope(m_Isolate);

	m_GlobalObject = v8::ObjectTemplate::New(m_Isolate);
	for (auto& callback : registrationList) {
		callback(m_GlobalObject, m_Isolate);
	}
	m_Context = v8::Context::New(m_Isolate, 0, m_GlobalObject);

	
	return true;
}

void ScriptEngine::Stop()
{
	m_Isolate->Dispose();
	v8::V8::Dispose();
	v8::V8::ShutdownPlatform();
	delete m_CreateParams.array_buffer_allocator;
}
bool ScriptEngine::ReadScriptFile(const char * path)
{
	std::string content;
	if (!ReadText(content, path))return false;
	Eval(content.c_str());
	return true;
}

void ScriptEngine::Eval(const char * str)
{
	Local<String> source = String::NewFromUtf8(m_Isolate, str);
	v8::Context::Scope context_scope(m_Context);
	Local<Script> script = Script::Compile(m_Context, source).ToLocalChecked();
	script->Run();
}

bool ScriptEngine::CallFunction(JS_OBJECT obj, const char* name, int argc, JS_VALUE * args,JS_VALUE &ret)
{
	v8::Context::Scope context_scope(m_Context);
	Handle<String> js_func_name = String::NewFromUtf8(m_Isolate, name);
	Handle<Value>  js_func_ref = obj->Get(js_func_name);
	if (!js_func_ref->IsFunction())
	{
		log_error("is not function:%s", name);
		return false;
	}
	Handle<Function> js_func = Handle<Function>::Cast(js_func_ref);
	ret = js_func->Call(obj, argc, args);
	return true;
}

bool ScriptEngine::CallFunction(JS_OBJECT obj, const char * name, int argc, JS_VALUE * args)
{
	return CallFunction(obj,name,argc,args,Handle<Value>());
}




bool ScriptEngine::CallFunction(JS_OBJECT obj, const char* name)
{
	return CallFunction(obj, name, 0, NULL, Handle<Value>());
}

bool ScriptEngine::CallGlobalFunction(const char * name, int argc, JS_VALUE * args, JS_VALUE & ret)
{
	return CallFunction(m_Context->Global(),name,argc,args,ret);
}

bool ScriptEngine::CallGlobalFunction(const char* name, int argc, JS_VALUE *args)
{
	return CallFunction(m_Context->Global(), name, argc, args, Handle<Value>());
}

bool ScriptEngine::CallGlobalFunction(const char* name)
{
	return CallFunction(m_Context->Global(), name, 0, NULL, Handle<Value>());
}

JS_OBJECT ScriptEngine::NewObject()
{
	Local<Object> obj = m_GlobalObject->NewInstance();
	return obj;
}

#endif
void ScriptEngine::RegisterNative(native_class_register_call call)
{
	registrationList.push_back(call);
}


