#include <log.h>
#include <common.h>
#include <tools.h>
#include <getopt.h>
#include "Server.h"
enum
{
	addr = 0x100,
	password,
	data_path,
	log_path,
	flag_daemon
};
struct option long_options[]=
{
	{"addr",1,0,addr },
	{"password",1,0,password },
	{"data_path",1,0,data_path },
	{ "daemon",0,0,flag_daemon },
	{ "log_path",1,0,log_path }
};

#pragma comment(lib,"./../3rd/spidermonkey/prebuilt/win32/mozjs-33.lib")


int main(int argc,char **argv)
{
	gServer.Run();
	bool as_daemon = false;
	while (1)
	{
		int option_index = 0;
		int option = getopt_long(argc, argv, "", long_options, &option_index);
		if (option <= 0)break;
		switch (option)
		{
		case data_path:
			//strcpy(gChannelServer.m_Config.data_config_path, optarg);
			break;
		case addr:
			//strcpy(gChannelServer.m_Config.addr, optarg);
			break;
		case password:
			//strcpy(gChannelServer.m_Config.pwd, optarg);
			break;
		case flag_daemon:
			as_daemon = true;
			break;
		case log_path:
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

	return 	0;
}