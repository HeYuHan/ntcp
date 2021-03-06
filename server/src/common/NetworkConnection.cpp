#include "NetworkConnection.h"
#include<string.h>
#include "log.h"
#include "WebSocket.h"
#define FLOAT_RATE 100.0f
NetworkStream::NetworkStream(int send_buff_size, int read_buff_size):web_frame(NULL)
{
	read_buff = new char[read_buff_size];
	write_buff = new char[send_buff_size];

	write_position = write_buff;
	write_buff_end = write_buff + send_buff_size;
	write_end = write_buff;

	read_offset = read_buff;
	read_end = read_buff;
	read_position = read_buff;
	read_buff_end = read_buff + send_buff_size;

}


NetworkStream::~NetworkStream()
{
	delete[] read_buff;
	delete[] write_buff;
	read_buff = NULL;
	write_buff = NULL;
}


void NetworkStream::OnRevcMessage()
{
	if (NULL == connection)return;
	try
	{
		int empty_size = read_buff_end - read_offset;
		int revc_size = connection->Read(read_offset, empty_size);
		if (revc_size == 0)
		{
			//log_info("revc_size is zero closed %s", "OnRevcMessage");
			connection->Disconnect();
			return;
		}
		read_offset += revc_size;
		int size = read_offset - read_position;
		if (connection->m_Type == TCP_SOCKET)
		{
			while (size > 4)
			{
				int data_len = 0;
				memcpy(&data_len, read_position, 4);
				if (size - 4 < data_len)break;
				read_position += 4;
				read_end = read_position + data_len;
				OnMessage();
				read_position = read_end;
				size = read_offset - read_position;
			}
		}
		else if (connection->m_Type == WEB_SOCKET)
		{
			if (web_frame == NULL)web_frame = read_position;
			size = read_offset - web_frame;
			while (size>1)
			{
				WebSokcetParser parser;
				int outHead = 0;
				int outSize = 0;

				int ret = parser.DecodeFrame(web_frame, size, outHead, outSize);
				if (ret == WS_PARSE_RESULT_ERROR)
				{
					log_info("websocket closed %s", "WS_PARSE_RESULT_ERROR");
					connection->Disconnect();
					return;
				}
				else if (ret == WS_PARSE_RESULT_SKIP)
				{
					int skip_len = outHead + outSize;
					size = size - skip_len;
					memmove(web_frame, web_frame + skip_len, size);
					read_offset = web_frame + size;
				}
				else if (ret == WS_PARSE_RESULT_WAIT_NEXT_DATA)
				{
					log_info("WS_PARSE_RESULT_WAIT_NEXT_DATA=>next size : %d", size);
					web_frame = NULL;
					return;
				}
				else if (ret == WS_PARSE_RESULT_WAIT_NETX_FRAME)
				{
					int skip_len = outHead;
					size = size - skip_len;
					memmove(web_frame, web_frame + skip_len, size);
					read_offset = web_frame + size;
					web_frame += outSize;
					size = size - outSize;
				}
				else if (ret == WS_PARSE_RESULT_OK)
				{
					int skip_len = outHead;
					size = size - skip_len;
					memmove(web_frame, web_frame + skip_len, size);
					read_offset = web_frame + size;
					read_end = web_frame + outSize;
					OnMessage();
					read_position = read_end;
					size = read_offset - read_position;
					web_frame = read_position;
					if (size > 0)log_info("WS_PARSE_RESULT_OK=>next size : %d", size);
					else web_frame = NULL;
				}
			}
		}
		size = read_offset - read_position;
		if ((read_position - read_buff) > 0 && size > 0)
		{
			memcpy(read_buff, read_position, size);
		}
		read_offset = read_buff + size;
		read_position = read_end = read_buff;
	}
	catch (...)
	{
		log_error("%s", "parse message error");
		if (connection)connection->Disconnect();
	}
}

void NetworkStream::Reset()
{
	write_position = write_buff;
	write_end = write_buff;

	read_offset = read_buff;
	read_end = read_buff;
	read_position = read_buff;
	web_frame = NULL;
}




void NetworkStream::WriteBool(bool b)
{
	byte value = b ? 1 : 0;
	WriteByte(value);
}

//////////////////////////////////////////////////////////////
//write data
void NetworkStream::WriteByte(byte data)
{
	WriteData(&data, sizeof(byte));
}
void NetworkStream::WriteChar(char data)
{
	WriteData(&data, sizeof(char));
}
void NetworkStream::WriteShort(short data)
{
	WriteData(&data, sizeof(short));
}
void NetworkStream::WriteUShort(ushort data)
{
	WriteData(&data, sizeof(ushort));
}
void NetworkStream::WriteInt(int data)
{
	WriteData(&data, sizeof(int));
}
void NetworkStream::WriteUInt(uint data)
{
	WriteData(&data, sizeof(uint));
}
void NetworkStream::WriteFloat(float data)
{
	int int_data = (int)(data*FLOAT_RATE);
	WriteData(&int_data, sizeof(int));
}
void NetworkStream::WriteLong(long data)
{
	WriteData(&data, sizeof(long));
}
void NetworkStream::WriteULong(ulong data)
{
	WriteData(&data, sizeof(ulong));
}
void NetworkStream::WriteString(const char* str)
{
	int len = strlen(str);
	WriteInt(len);
	WriteData(str, len);
}
void NetworkStream::WriteData(const void* data, int count)
{
	if (write_buff == NULL || count < 0 || write_end + count > write_buff_end)
	{
		throw WRITEERROR;
	}
	if (count > 0)
	{
		memcpy(write_end, data, count);
		write_end += count;
	}

}
void NetworkStream::WriteVector3(Vector3 & v3)
{
	WriteFloat(v3.x);
	WriteFloat(v3.y);
	WriteFloat(v3.z);
}
void NetworkStream::WriteShortQuaternion(Quaternion & rot)
{
	short x = rot.x * 1000;
	short y = rot.y * 1000;
	short z = rot.z * 1000;
	short w = rot.w * 1000;
	WriteShort(x);
	WriteShort(y);
	WriteShort(z);
	WriteShort(w);
}
void NetworkStream::BeginWrite()
{
	write_position = write_buff;
	write_end = write_buff;
	if (connection->m_Type == UDP_SOCKET)
	{
		write_end = write_buff + 5;
	}
	else if(connection->m_Type == TCP_SOCKET)
	{
		write_end = write_buff + 4;
	}

}
void NetworkStream::EndWrite()
{
	int head_len = connection->m_Type == UDP_SOCKET ? 5 : 4;
	int data_len = write_end - write_position - head_len;
	if (connection->m_Type == UDP_SOCKET)
	{
		write_position[0] = GAME_MSG;
		memcpy(write_position+1, &data_len, 4);
	}
	else if(connection->m_Type == TCP_SOCKET)
	{
		memcpy(write_position, &data_len, 4);
	}
	else
	{
		head_len = 0;
		data_len = write_end - write_position;
		WebSokcetParser parser;
		int outSize = 0;
		parser.EncodeFrame(write_position, data_len, write_buff_end-write_end, outSize);
		if (outSize > 0)
		{
			data_len = outSize;
		}
	}
	if (connection&&data_len>0)connection->Send(write_position, data_len+head_len);
}
//////////////////////////////////////////////////////////////
//read data
void NetworkStream::ReadByte(byte &data)
{
	ReadData(&data, sizeof(byte));
}
void NetworkStream::ReadByte(char &data)
{
	ReadData(&data, sizeof(char));
}
void NetworkStream::ReadShort(short &data)
{
	ReadData(&data, sizeof(short));
}
void NetworkStream::ReadUShort(ushort &data)
{
	ReadData(&data, sizeof(ushort));
}
void NetworkStream::ReadInt(int &data)
{
	ReadData(&data, sizeof(int));
}
void NetworkStream::ReadUInt(uint &data)
{
	ReadData(&data, sizeof(uint));
}
void NetworkStream::ReadFloat(float &data)
{
	int ret = 0;
	ReadInt(ret);
	data = ret / FLOAT_RATE;
}
void NetworkStream::ReadLong(long &data)
{
	ReadData(&data, sizeof(long));
}
void NetworkStream::ReadULong(ulong &data)
{
	ReadData(&data, sizeof(ulong));
}
int NetworkStream::ReadString(char* str, int size)
{
	int len = 0;
	ReadInt(len);
	if (len < 0 || size<len)
	{
		throw READERROR;

	}
	str[len] = 0;
	ReadData(str, len);
	return len;
}
void NetworkStream::ReadData(void* data, int count)
{
	if (read_buff == NULL || count < 0 || read_position + count > read_end)
	{
		throw READERROR;
	}
	if (count > 0)
	{
		memcpy(data, read_position, count);
		read_position += count;
	}
}

void NetworkStream::ReadVector3(Vector3 & v3)
{
	ReadFloat(v3.x);
	ReadFloat(v3.y);
	ReadFloat(v3.z);
}

void NetworkStream::ReadShortQuaternion(Quaternion & rot)
{
	short x, y, z, w;
	ReadShort(x);
	ReadShort(y);
	ReadShort(z);
	ReadShort(w);
	rot = Quaternion(x / 1000.0f, y / 1000.0f, z / 1000.0f, w / 1000.0f);
}















NetworkConnection::NetworkConnection():
	stream(NULL)
{
}

NetworkConnection::~NetworkConnection()
{
	stream = NULL;
}

