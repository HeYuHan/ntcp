#include "FileReader.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include<json/reader.h>

using namespace std;
bool ReadText(std::string &ret, const std::string path)
{
	ifstream file_in(path, ios::in);
	if (file_in.is_open())
	{
		std::stringstream buffer;
		buffer << file_in.rdbuf();
		ret = std::string(buffer.str());
		return true;
	}
	return false;
}

bool WriteText(const std::string text, const std::string path)
{
	ofstream file_out(path.c_str());
	bool ret = file_out.is_open();
	if (ret)
	{
		file_out << text.c_str() << endl;
		file_out.close();
	}
	return ret;
}


bool ReadJson(Json::Value &root, const char* path)
{
	ifstream file_in(path,ios::in);
	bool ret = false;
	if (!file_in.fail())
	{

		Json::Reader reader;
		ret = reader.parse(file_in, root);
		
	}
	file_in.close();
	return ret;
}
