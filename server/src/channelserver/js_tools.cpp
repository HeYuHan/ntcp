#ifdef SPIDERMONKEY_ENGINE
#include "js_tools.h"
#include <log.h>
#include <jsfriendapi.h>
#include <common.h>
#include <ccUTF8.h>
#include <iconv.h>
#ifdef _WIN32
#pragma comment(lib,"./../3rd/icon/lib/iconv.lib")
#endif // _WIN32
#define CC_SAFE_DELETE_ARRAY(p)     do { if(p) { delete[] (p); (p) = nullptr; } } while(0)
// JSStringWrapper
JSStringWrapper::JSStringWrapper()
	: _buffer(nullptr)
{
}

JSStringWrapper::JSStringWrapper(JS::HandleString str, JSContext* cx/* = NULL*/)
	: _buffer(nullptr)
{
	set(str, cx);
}

JSStringWrapper::JSStringWrapper(JS::HandleValue val, JSContext* cx/* = NULL*/)
	: _buffer(nullptr)
{
	set(val, cx);
}

JSStringWrapper::~JSStringWrapper()
{
	JS_free(ScriptingCore::GetInstance()->GetGlobalContext(), (void*)_buffer);
}

void JSStringWrapper::set(JS::HandleValue val, JSContext* cx)
{
	if (val.isString())
	{
		JS::RootedString str(cx, val.toString());
		this->set(str, cx);
	}
	else
	{
		CC_SAFE_DELETE_ARRAY(_buffer);
	}
}

void JSStringWrapper::set(JS::HandleString str, JSContext* cx)
{
	CC_SAFE_DELETE_ARRAY(_buffer);

	if (!cx)
	{
		cx = ScriptingCore::GetInstance()->GetGlobalContext();
	}
	_buffer = JS_EncodeStringToUTF8(cx, str);
}

const char* JSStringWrapper::get()
{
	return _buffer ? _buffer : "";
}

void GetJSUTF8String(JSContext * cx, JS::HandleValue v, std::string & ret)
{
	JS::RootedString str(cx, v.toString());
	char* data = JS_EncodeStringToUTF8(cx, str);
	ret = std::string(data);
	JS_free(cx, (void*)data);
}
void GetJSString(JSContext * cx, JS::HandleValue v, std::string & ret)
{
	JS::RootedString str(cx, v.toString());
	char* data = JS_EncodeString(cx, str);
	ret = std::string(data);
	JS_free(cx, (void*)data);
}
//bool js_utf8_to_utf16(std::string &utf8, std::string &retStr)
//{
//	bool ok = true;
//	iconv_t iconvH = iconv_open("utf-8", "gb2312");
//	do 
//	{
//		
//		if (iconvH == 0)
//		{
//			ok = false;
//			break;
//		}
//		size_t srclen = strlen(utf8.c_str());
//		size_t outLen = 1024;
//		/* 存放转换后的字符串 */
//		char outbuf[1024];
//		memset(outbuf, 0, 1024);
//		/* 由于iconv()函数会修改指针，所以要保存源指针 */
//		const char *pin = utf8.c_str();
//		char *pout = outbuf;
//
//		/* 进行转换
//		*@param cd iconv_open()产生的句柄
//		*@param srcstart 需要转换的字符串
//		*@param srclen 存放还有多少字符没有转换
//		*@param tempoutbuf 存放转换后的字符串
//		*@param outlen 存放转换后,tempoutbuf剩余的空间
//		*
//		* */
//		do {
//			size_t ret = iconv(iconvH, &pin, &srclen, &pout, &outLen);
//			if (ret == -1)
//			{
//				ret = false;
//				ok = false;
//				break;
//			}
//		} while (srclen > 0);
//		retStr = std::string(outbuf);
//	} while (0);
//	/* 关闭句柄 */
//	iconv_close(iconvH);
//	return true;
//}

jsval std_string_to_jsval(JSContext* cx, const std::string& v)
{
	return c_string_to_jsval(cx, v.c_str(), v.size());
}

jsval c_string_to_jsval(JSContext* cx, const char* v, size_t length /* = -1 */)
{
	if (v == NULL)
	{
		return JSVAL_NULL;
	}
	if (length == -1)
	{
		length = strlen(v);
	}

	if (0 == length)
	{
		auto emptyStr = JS_NewStringCopyZ(cx, "");
		return STRING_TO_JSVAL(emptyStr);
	}

	jsval ret = JSVAL_NULL;

#if defined(_MSC_VER) && (_MSC_VER <= 1800)
	// NOTE: Visual Studio 2013 (Platform Toolset v120) is not fully C++11 compatible.
	// It also doesn't provide support for char16_t and std::u16string.
	// For more information, please see this article
	// https://blogs.msdn.microsoft.com/vcblog/2014/11/17/c111417-features-in-vs-2015-preview/
	int utf16_size = 0;
	const jschar* strUTF16 = (jschar*)cc_utf8_to_utf16(v, (int)length, &utf16_size);

	if (strUTF16 && utf16_size > 0) {
		JSString* str = JS_NewUCStringCopyN(cx, strUTF16, (size_t)utf16_size);
		if (str) {
			ret = STRING_TO_JSVAL(str);
		}
		delete[] strUTF16;
	}
#else
	std::u16string strUTF16;
	bool ok = StringUtils::UTF8ToUTF16(std::string(v, length), strUTF16);

	if (ok && !strUTF16.empty()) {
		JSString* str = JS_NewUCStringCopyN(cx, reinterpret_cast<const jschar*>(strUTF16.data()), strUTF16.size());
		if (str) {
			ret = STRING_TO_JSVAL(str);
		}
	}
#endif

	return ret;
}
static NS_MAP::unordered_map<void*, js_proxy_t*> _native_js_global_map;
static NS_MAP::unordered_map<JSObject*, js_proxy_t*> _js_native_global_map;
NS_MAP::unordered_map<std::string, js_type_class_t*> _js_global_type_map;
//server
JSObject* jsb_ref_create_jsobject(JSContext *cx, void *ref, js_type_class_t *typeClass, const char* debug, bool create_proxy)
{
	JS::RootedObject proto(cx, typeClass->proto.ref());
	JS::RootedObject parent(cx, typeClass->parentProto.ref());
	JSObject *obj = JS_NewObject(cx, typeClass->jsclass, proto, parent);
	JS::RootedObject jsObj(cx, obj);
	
	if (create_proxy)
	{
		js_proxy_t* newproxy = jsb_new_proxy(ref, jsObj);
	}
	return jsObj;
}
js_proxy_t* jsb_new_proxy(void* nativeObj, JS::HandleObject jsHandle)
{
	js_proxy_t* proxy = nullptr;
	JSObject* jsObj = jsHandle.get();

	if (nativeObj && jsObj)
	{
		// native to JS index
		proxy = (js_proxy_t *)malloc(sizeof(js_proxy_t));

#if 0
		if (_js_native_global_map.find(jsObj) != _js_native_global_map.end())
		{
			CCLOG("BUG: old:%s new:%s", JS_GetClass(_js_native_global_map.at(jsObj)->_jsobj)->name, JS_GetClass(jsObj)->name);
		}
#endif

		//CC_ASSERT(_native_js_global_map.find(nativeObj) == _native_js_global_map.end() && "Native Key should not be present");
		// If native proxy doesn't exist, and js proxy exist, means previous js object in this location have already been released.
		// In some circumstances, js object may be released without calling its finalizer, so the proxy haven't been removed.
		// For ex: var seq = cc.sequence(moveBy, cc.callFunc(this.callback, this));
		// In this code, cc.callFunc is created in parameter, and directly released after the native function call, the finalizer won't be triggered.
		// The current solution keep the game running with a warning because it may cause memory leak as the native object may have been retained.
		auto existJSProxy = _js_native_global_map.find(jsObj);
		if (existJSProxy != _js_native_global_map.end()) {
#if COCOS2D_DEBUG > 1
			CCLOG("jsbindings: Failed to remove proxy for native object: %p, force removing it, but it may cause memory leak", existJSProxy->second->ptr);
#endif
			jsb_remove_proxy(existJSProxy->second);
		}

		proxy->ptr = nativeObj;
		proxy->obj = jsObj;
		proxy->_jsobj = jsObj;

		// One Proxy in two entries
		_native_js_global_map[nativeObj] = proxy;
		_js_native_global_map[jsObj] = proxy;
	}
	//else CCLOG("jsb_new_proxy: Invalid keys");

	return proxy;
}

js_proxy_t* jsb_get_native_proxy(void* nativeObj)
{
	auto search = _native_js_global_map.find(nativeObj);
	if (search != _native_js_global_map.end())
		return search->second;
	return nullptr;
}

js_proxy_t* jsb_get_js_proxy(JS::HandleObject jsObj)
{
	auto search = _js_native_global_map.find(jsObj);
	if (search != _js_native_global_map.end())
		return search->second;
	return nullptr;
}

void jsb_remove_proxy(js_proxy_t* nativeProxy, js_proxy_t* jsProxy)
{
	js_proxy_t* proxy = nativeProxy ? nativeProxy : jsProxy;
	jsb_remove_proxy(proxy);
}

void jsb_remove_proxy(js_proxy_t* proxy)
{
	void* nativeKey = proxy->ptr;
	JSObject* jsKey = proxy->_jsobj;

	//CC_ASSERT(nativeKey && "Invalid nativeKey");
	//CC_ASSERT(jsKey && "Invalid JSKey");

	auto it_nat = _native_js_global_map.find(nativeKey);
	auto it_js = _js_native_global_map.find(jsKey);

	if (it_nat != _native_js_global_map.end())
	{
		_native_js_global_map.erase(it_nat);
	}
	//else CCLOG("jsb_remove_proxy: failed. Native key not found");

	if (it_js != _js_native_global_map.end())
	{
		// Free it once, since we only have one proxy alloced entry
		free(it_js->second);
		_js_native_global_map.erase(it_js);
	}
	//else CCLOG("jsb_remove_proxy: failed. JS key not found");
}
ScriptingCore::ScriptingCore():
	_global(NULL),
	_cx(NULL),
	_rt(NULL)
{
}

ScriptingCore::~ScriptingCore()
{
}
ScriptingCore *m_SharedInstance = NULL;
static std::vector<sc_register_sth> registrationList;
ScriptingCore * ScriptingCore::GetInstance()
{
	if (m_SharedInstance == NULL)
	{
		m_SharedInstance = new ScriptingCore();
	}
	return m_SharedInstance;
}
void report_error(JSContext *cx, const char *message, JSErrorReport *report) {
	log_error("%s:%u:%s\n",
		report->filename ? report->filename : "<no filename=\"filename\">",
		(unsigned int)report->lineno,
		message);
}
static void sc_finalize(JSFreeOp *freeOp, JSObject *obj) {
	log_debug("jsbindings: finalizing JS object %p (global class)", obj);
}
static const JSClass global_class = {
	"global", JSCLASS_GLOBAL_FLAGS,
	JS_PropertyStub, JS_DeletePropertyStub, JS_PropertyStub, JS_StrictPropertyStub,
	JS_EnumerateStub, JS_ResolveStub, JS_ConvertStub, sc_finalize,
	nullptr, nullptr, nullptr,
	JS_GlobalObjectTraceHook
};
class CCJSPrincipals : public JSPrincipals
{
public:
	explicit CCJSPrincipals(int rc = 0)
		: JSPrincipals()
	{
		refcount = rc;
	}
};
static CCJSPrincipals shellTrustedPrincipals(1);
JSObject* NewGlobalObject(JSContext* cx, bool debug)
{
	JS::CompartmentOptions options;
	options.setVersion(JSVERSION_LATEST);

	JS::RootedObject glob(cx, JS_NewGlobalObject(cx, &global_class, &shellTrustedPrincipals, JS::DontFireOnNewGlobalHook, options));
	if (!glob) {
		return nullptr;
	}
	JSAutoCompartment ac(cx, glob);
	bool ok = true;
	ok = JS_InitStandardClasses(cx, glob);
	if (ok)
		JS_InitReflect(cx, glob);
	if (!ok)
		return nullptr;

	JS_FireOnNewGlobalObject(cx, glob);

	return glob;
}
bool ScriptingCore::Start()
{
	if (!JS_Init())return false;
	const size_t RUN_TIME_BUFF_LEN = 32L * 1024L * 1024L;
	const size_t CONTEXT_STACK_SIZE = 32 * 1024;
	_rt = JS_NewRuntime(RUN_TIME_BUFF_LEN);
	JS_SetGCParameter(_rt, JSGCParamKey::JSGC_MAX_BYTES, 0xffffffff);
	JS_SetGCParameter(_rt, JSGCParamKey::JSGC_MODE, JSGC_MODE_COMPARTMENT);
	_cx = JS_NewContext(_rt, CONTEXT_STACK_SIZE);
	JS_SetErrorReporter(_cx, report_error);
	JS::RuntimeOptionsRef(_rt).setIon(true);
	JS::RuntimeOptionsRef(_rt).setBaseline(true);
	_global = new (std::nothrow) JS::PersistentRootedObject(_rt, NewGlobalObject(_cx, false));
	JS::RootedObject global(_cx, _global->get());

	// Removed in Firefox v34
	//js::SetDefaultObjectForContext(_cx, global);
	JSAutoCompartment ac(_cx, global);
	for (auto& callback : registrationList) {
		callback(_cx, global);
	}
	return true;
}

void ScriptingCore::Stop()
{
	JS_DestroyContext(_cx);
	JS_DestroyRuntime(_rt);
	JS_ShutDown();
}

bool ScriptingCore::RunScript(const char * path)
{

	JS::RootedObject global(_cx, _global->get());
	JSCompartment *comp1 = JS_EnterCompartment(_cx, global);
	//JSAutoCompartment ac2(_cx, global);
	//JS::RootedObject obj(_cx, global);
	JS::CompileOptions op(_cx);
	op.setUTF8(true);
	JS::PersistentRootedScript* script = new (std::nothrow) JS::PersistentRootedScript(_cx);
	bool ok = JS::Compile(_cx, global, op, path, &(*script));
	if (ok)
	{
		//JSCompartment *comp2 = JS_EnterCompartment(_cx, global);
		//JS::RootedValue rval(_cx);
		//JS::RootedObject global2(_cx, _global->get());
		//JSAutoCompartment ac2(_cx, global2);
		bool ret = JS_ExecuteScript(_cx, global, *script);
		//JS_LeaveCompartment(_cx, comp2);
		return ret;
	}
	JS_LeaveCompartment(_cx, comp1);
	return false;
	
	//if (evaluatedOK)
	//{
	//	jsval vals[2];
	//	vals[0] = INT_TO_JSVAL(123);
	//	//JS::RootedObject obj2(_cx, _global->get());
	//	//JSAutoCompartment ac4(_cx, obj2);
	//	vals[1] = STRING_TO_JSVAL(JS_NewStringCopyN(_cx, "sadf", 4));
	//	JS::RootedValue rval2(_cx);
	//	//JS::RootedObject obj3(_cx, _global->get());
	//	//JSAutoCompartment ac5(_cx, obj3);
	//	evaluatedOK = JS_CallFunctionName(_cx, global, "calljs", JS::HandleValueArray::fromMarkedLocation(2, vals), &rval2);
	//	std::cout << JS_EncodeStringToUTF8(_cx, JS::RootedString(_cx, rval2.toString()));
	//	JS::RootedValue rval3(_cx);
	//	evaluatedOK = JS_GetProperty(_cx, global, "today", &rval3);

	//	std::cout << JS_EncodeStringToUTF8(_cx, JS::RootedString(_cx, rval3.toString()));
	//}
}

bool ScriptingCore::Eval(const char* script, JS::RootedValue &ret)
{
	//JSB_AUTOCOMPARTMENT_WITH_GLOBAL_OBJCET
	JS::RootedObject global(_cx, _global->get());
	JSAutoCompartment ac(_cx, global);
	if (JS_EvaluateScript(_cx, global, script, (unsigned int)strlen(script), "(string)", 1, &ret) == true) {
		return true;
	}
	return false;
}

bool ScriptingCore::Eval(const char * script)
{
	JS::RootedValue rval(_cx);
	return Eval(script, rval);
}

bool ScriptingCore::CallFunction(jsval owner, const char *name, uint32_t argc, jsval *vp, JS::MutableHandleValue retVal)
{
	JS::HandleValueArray args = JS::HandleValueArray::fromMarkedLocation(argc, vp);
	return CallFunction(owner, name, args, retVal);
}

bool ScriptingCore::CallFunction(jsval owner, const char * name, const JS::HandleValueArray & args, JS::MutableHandleValue retVal)
{
	bool bRet = false;
	bool hasFunc;
	JSContext* cx = this->_cx;
	JS::RootedValue funcVal(cx);
	//JS::RootedValue ownerval(cx, owner);
	JS::RootedObject ownerval(cx, owner.toObjectOrNull());
	
	do
	{
		auto ac = JS_EnterCompartment(cx, ownerval);
		//JSAutoCompartment ac(cx, ownerval);

		if (JS_HasProperty(cx, ownerval, name, &hasFunc) && hasFunc) {
			if (!JS_GetProperty(cx, ownerval, name, &funcVal)) {
				break;
			}
			if (funcVal == JSVAL_VOID) {
				break;
			}

			bRet = JS_CallFunctionValue(cx, ownerval, funcVal, args, retVal);
		}
		JS_LeaveCompartment(cx,ac);
	} while (0);
	return bRet;
}

bool ScriptingCore::CallFunction(jsval owner, const char * name, const JS::HandleValueArray & args)
{
	JS::RootedValue ret(_cx);
	return CallFunction(owner, name, args, &ret);
}

bool ScriptingCore::CallFunction(jsval owner, const char * name)
{
	JS::RootedValue ret(_cx);
	JS::HandleValueArray args = JS::HandleValueArray::empty();
	return CallFunction(owner, name, args, &ret);
}

bool ScriptingCore::CallGlobalFunction(const char * name, const JS::HandleValueArray & args, JS::MutableHandleValue retVal)
{
	JS::RootedObject global(_cx, _global->get());
	JSAutoCompartment ac5(_cx, _global->get());
	return JS_CallFunctionName(_cx, global, name, args, retVal);
}

bool ScriptingCore::CallGlobalFunction(const char * name)
{
	JS::HandleValueArray args = JS::HandleValueArray::empty();
	JS::RootedValue ret(_cx);
	return CallGlobalFunction(name, args, &ret);
}

void ScriptingCore::GC()
{
	JS_MaybeGC(_cx);
}

void ScriptingCore::RemoveObjectProxy(void * obj)
{
	auto proxy = jsb_get_native_proxy(obj);
	if (proxy)
	{
		jsb_remove_proxy(proxy);
	}
}

JSObject * ScriptingCore::GetGlobalObject()
{
	return _global->get();
}

JSContext * ScriptingCore::GetGlobalContext()
{
	return _cx;
}

void ScriptingCore::RegisterJSClass(sc_register_sth call)
{
	registrationList.push_back(call);
}
#endif