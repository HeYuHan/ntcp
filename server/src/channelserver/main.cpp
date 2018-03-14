#include <log.h>
#include <common.h>
#include <tools.h>
#include <getopt.h>
#include "Server.h"
enum
{
	script = 0x100,
	flag_log,
	flag_daemon
};
struct option long_options[]=
{
	{"script",1,0,script },
	{"log_path",1,0,flag_log },
	{ "daemon",0,0,flag_daemon },
};

#pragma comment(lib,"./../3rd/spidermonkey/prebuilt/win32/mozjs-33.lib")


int main(int argc,char **argv)
{
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