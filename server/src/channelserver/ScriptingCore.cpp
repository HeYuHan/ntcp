#include "ScriptingCore.h"
#include "FileReader.h"
#include <string.h>
#include <log.h>
#include "Server.h"
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
const char* ToCString(const v8::String::Utf8Value& value) {
	return *value ? *value : "<string conversion failed>";
}
void ReportException(Isolate *isolate, v8::TryCatch* try_catch) {
	v8::HandleScope handle_scope(isolate);
	v8::String::Utf8Value exception(try_catch->Exception());
	const char* exception_string = ToCString(exception);
	v8::Handle<v8::Message> message = try_catch->Message();
	if (message.IsEmpty()) {
		// V8 didn't provide any extra information about this error; just
		// print the exception.
		printf("%s\n", exception_string);
	}
	else {
		// Print (filename):(line number): (message).
		v8::String::Utf8Value filename(message->GetScriptResourceName());
		const char* filename_string = ToCString(filename);
		int linenum = message->GetLineNumber();
		printf("%s:%i: %s\n", filename_string, linenum, exception_string);
		// Print line of source code.
		v8::String::Utf8Value sourceline(message->GetSourceLine());
		const char* sourceline_string = ToCString(sourceline);
		printf("%s\n", sourceline_string);
		// Print wavy underline (GetUnderline is deprecated).
		//int start = message->GetStartColumn();
		//for (int i = 0; i < start; i++) {
		//	printf(" ");
		//}
		//int end = message->GetEndColumn();
		//for (int i = start; i < end; i++) {
		//	printf("^");
		//}
		//printf("\n");
		v8::String::Utf8Value stack_trace(try_catch->StackTrace());
		if (stack_trace.length() > 0) {
			const char* stack_trace_string = ToCString(stack_trace);
			log_error("%s", stack_trace_string);
		}
	}
}
bool ExecuteString(Isolate *isolate,v8::Handle<v8::String> source,
	v8::Handle<v8::String> name,
	bool print_result,
	bool report_exceptions)
{
	v8::HandleScope handle_scope(isolate);
	v8::TryCatch try_catch(isolate);   //���������쳣����
	v8::Handle<v8::Script> script = v8::Script::Compile(source, name);
	if (script.IsEmpty()) {
		// Print errors that happened during compilation.
		if (report_exceptions)
			ReportException(isolate,&try_catch);
		return false;
	}
	else {
		v8::Handle<v8::Value> result = script->Run();
		if (result.IsEmpty()) {
			//assert(try_catch.HasCaught());
			// Print errors that happened during execution.
			if (report_exceptions)
				ReportException(isolate,&try_catch);
			return false;
		}
		else {
			//assert(!try_catch.HasCaught());
			if (print_result && !result->IsUndefined()) {
				// If all went well and the result wasn't undefined then print
				// the returned value.
				v8::String::Utf8Value str(result);
				const char* cstr = ToCString(str);
				printf("%s\n", cstr);
			}
			return true;
		}
	}
}
//��ȡjs�ļ�
v8::Handle<v8::String> ReadFile(Isolate *isolate,const char* name)
{
	FILE* file = fopen(name, "rb");
	if (file == NULL) return v8::Handle<v8::String>();
	fseek(file, 0, SEEK_END);
	int size = ftell(file);
	rewind(file);
	char* chars = new char[size + 1];
	chars[size] = '\0';
	for (int i = 0; i < size;)
	{
		int read = fread(&chars[i], 1, size - i, file);
		i += read;
	}
	fclose(file);
	v8::Handle<v8::String> result = v8::String::NewFromUtf8(isolate,chars);
	delete[] chars;
	return result;
}
bool ScriptEngine::Start()
{
	v8::Platform *platform = v8::platform::CreateDefaultPlatform();
	v8::V8::InitializePlatform(platform);
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

	




	v8::Context::Scope context_scope(m_Context);
	ReadScriptFile(gServer.m_MainScriptPath);

	

	CallGlobalFunction("Main");
	
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
	Eval(content.c_str(), path);
	return true;
}

void ScriptEngine::Eval(const char * str, const char* fileName)
{
	v8::HandleScope handle_scope(m_Isolate);
	Local<String> source = String::NewFromUtf8(m_Isolate, str);
	Local<String> name = String::NewFromUtf8(m_Isolate, fileName);
	ExecuteString(m_Isolate, source, name, true, true);
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
	v8::Context::Scope context_scope(m_Context);
	Handle<Value> ret;
	return CallFunction(obj,name,argc,args,ret);
}




bool ScriptEngine::CallFunction(JS_OBJECT obj, const char* name)
{
	v8::Context::Scope context_scope(m_Context);
	Handle<Value> ret;
	return CallFunction(obj, name, 0, NULL, ret);
}

bool ScriptEngine::CallGlobalFunction(const char * name, int argc, JS_VALUE * args, JS_VALUE & ret)
{
	return CallFunction(m_Context->Global(),name,argc,args,ret);
}

bool ScriptEngine::CallGlobalFunction(const char* name, int argc, JS_VALUE *args)
{
	v8::Context::Scope context_scope(m_Context);
	Handle<Value> ret;
	return CallFunction(m_Context->Global(), name, argc, args, ret);
}

bool ScriptEngine::CallGlobalFunction(const char* name)
{
	v8::Context::Scope context_scope(m_Context);
	Handle<Value> ret;
	return CallFunction(m_Context->Global(), name, 0, NULL, ret);
}

JS_OBJECT ScriptEngine::NewObject()
{
	Local<Object> obj = m_GlobalObject->NewInstance();
	return obj;
}

void ScriptEngine::InitV8(char * arg)
{
	v8::V8::InitializeICUDefaultLocation(arg);
	v8::V8::InitializeExternalStartupData(arg);
}

#endif
void ScriptEngine::RegisterNative(native_class_register_call call)
{
	registrationList.push_back(call);
}

