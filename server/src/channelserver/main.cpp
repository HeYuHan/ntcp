#include <log.h>
#include <common.h>
#include <tools.h>
#include <getopt.h>
#include "Server.h"
#include <HttpConnection3.h>
#include <Timer.h>
enum
{
	script = 0x100,
	flag_addr,
	flag_log,
	flag_daemon
};
struct option long_options[]=
{
	{"script",1,0,script },
	{"addr",1,0,flag_addr },
	{"log_path",1,0,flag_log },
	{ "daemon",0,0,flag_daemon },
};

#pragma comment(lib,"./../3rd/spidermonkey/prebuilt/win32/mozjs-33.lib")


int main(int argc,char **argv)
{
//
//#ifdef WIN32  
//	WSAData wsaData;
//	WSAStartup(MAKEWORD(2, 0), &wsaData);
//#endif
//	for (int i = 0; i < 10;i++)gHttpManager.Get("https://www.baidu.com");
//	Timer::Loop();
//	_CrtDumpMemoryLeaks();
//	return 0;
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
		case '?':
			return 1;
			break;
		default:
			break;
		}
	}
	if (as_daemon && !RunAsDaemon())
	{
		log_error("%s", "run as daemon error!");
		return -1;
	}

	return 	gServer.Run();
}