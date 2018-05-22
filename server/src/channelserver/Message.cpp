#include "Message.h"
#include <string>
using namespace Json;
using namespace std;
MessageParser::MessageParser()
{
}

MessageParser::~MessageParser()
{
}

bool MessageParser::DecodeMessage(NetworkStream * stream,int &id)
{
	int size = stream->read_end - stream->read_position;
	if (size > 0)
	{
		m_JsonRoot.clear();
		Reader reader;
		bool ret = reader.parse(stream->read_position, stream->read_end, m_JsonRoot);
		Value json_id = m_JsonRoot["id"];
		if (ret && !json_id.isNull())
		{
			id = json_id.asInt();
			return true;
		}
	}
	return false;
}

bool MessageParser::EncodeMessage(NetworkStream * stream)
{
	FastWriter writer;
	std::string str = writer.write(m_JsonRoot);
	stream->WriteData(str.c_str(), str.size());
	return true;
}

void MessageParser::Clean()
{
	m_JsonRoot.clear();
}

Json::Value * MessageParser::GetJson()
{
	return &m_JsonRoot;
}
