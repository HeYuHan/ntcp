#include <log.h>
#include <common.h>
#include <tools.h>
#include <getopt.h>
#include "Server.h"
#include <HttpConnection3.h>
#include <Timer.h>
#include <FileReader.h>
#include "ScriptingCore.h"
enum
{
	script = 0x100,
	flag_addr,
	flag_log,
	flag_daemon,
	flag_v8
};
struct option long_options[]=
{
	{"script",1,0,script },
	{"addr",1,0,flag_addr },
	{"log_path",1,0,flag_log },
	{ "daemon",0,0,flag_daemon },
	{"v8",1,0,flag_v8 }
};
#ifdef SPIDERMONKEY_ENGINE

#pragma comment(lib,"./../3rd/spidermonkey/prebuilt/win32/mozjs-33.lib")
#endif // WIN32

char* V8_BIN_PATH=NULL;

int main(int argc,char **argv)
{
	char v8_bin_path[256] = { 0 };
	int len = strlen(argv[0]);
	int dir = 0;
	for (int i = len - 1; i >= 0; i--)
	{
		char c = argv[0][i];
		if (c == '/' || c == '\\')
		{
			dir = i;
			break;
		}
	}
	memcpy(v8_bin_path, argv[0], dir);
	strcpy(&v8_bin_path[dir], "/v8/");

	bool as_daemon = false;
	while (1)
	{
		int option_index = 0;
		int option = getopt_long(argc, argv, "", long_options, &option_index);
		if (option <= 0)break;
		switch (option)
		{
		case script:
			strcpy(gServer.m_MainScriptPath, optarg);
			gServer.m_MainScriptPath[strlen(optarg)] = 0;
			break;
		case flag_addr:
			strcpy(gServer.m_Addr, optarg);
			gServer.m_Addr[strlen(optarg)] = 0;
			break;
		case flag_daemon:
			as_daemon = true;
			break;
		case flag_log:
			gLogger.m_LogToFile = true;
			strcpy(gLogger.filePath, optarg);
			break;
		case flag_v8:
			strcpy(v8_bin_path, optarg);
			v8_bin_path[strlen(optarg)] = 0;
			break;
		case '?':
			return 1;
			break;
		default:
			break;
		}
	}
	V8_BIN_PATH = v8_bin_path;
	if (as_daemon && !RunAsDaemon())
	{
		log_error("%s", "run as daemon error!");
		return -1;
	}
	int ret = gServer.Run();
	return 	ret;
}