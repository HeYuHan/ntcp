#pragma once
#ifndef __MESSAGE_PARSER_H__
#define __MESSAGE_PARSER_H__
#include <NetworkConnection.h>
#include <json/json.h>
class MessageParser
{
public:
	MessageParser();
	~MessageParser();
public:
	virtual bool DecodeMessage(NetworkStream * stream, int &id);
	virtual bool EncodeMessage(NetworkStream* stream);
	void Clean();
	Json::Value* GetJson();
private:
	Json::Value m_JsonRoot;

};


#endif // !__MESSAGE_PARSER_H__
