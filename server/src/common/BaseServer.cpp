#include "BaseServer.h"
#include <event2/event_struct.h>
#include <event2/util.h>
#include "Timer.h"
BaseServer::BaseServer()
{
	
}

BaseServer::~BaseServer()
{
}

bool BaseServer::Init()
{

	return true;
}

int BaseServer::Run()
{
	return Timer::Loop();
	
}
