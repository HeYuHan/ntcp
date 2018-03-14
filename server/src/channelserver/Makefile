CC = g++
#yum install zlib-devel
#yum install zlib

LFLAGS = -m64 -pthread -lz
CFLAGS = -c -fPIC

PF = LINUX
RAKNET_SOURCE_DIR = ../../3rd/RakNet
SPIDERMONKEY_HEAD_DIR = ../../3rd/spidermonkey/include/linux
SPIDERMONKEY_LIB = ../../3rd/spidermonkey/prebuilt/linux/64-bit/libjs_static.a
COMMON_LIB = ../lib/libcommon.a
TARGET = ../bin/channelserver
SOURCES = $(wildcard *.cpp)
OBJS = $(patsubst %.cpp,objs/%.o,$(SOURCES)) $(COMMON_LIB) $(SPIDERMONKEY_LIB)


ifneq ($(shell uname), Linux) 
	PF = MACOS
else
	LFLAGS += -lrt
endif

CFLAGS += -D$(PF)

ifdef RELEASE
	CFLAGS += -Wall -Werror -g -O2
	LFLAGS += -Wall -Werror -g -O2
else
	CFLAGS += -g -D_DEBUG
	LFLAGS += -g
endif
CFLAGS += -I.
CFLAGS += -I./../common/
CFLAGS += -I./$(RAKNET_SOURCE_DIR)/Source
CFLAGS += -I./$(SPIDERMONKEY_HEAD_DIR)
CFLAGS += -I/usr/local
CFLAGS += -std=c++0x
CFLAGS += -std=c++11


#DEPS = $(patsubst %.cpp,objs/%.d,$(SOURCES))


default : $(TARGET)

objs/%.o: %.cpp
	$(CC) $(CFLAGS) -o $@ $<

#-include $(DEPS)

clean :
	rm -f $(TARGET) objs/*.o

$(TARGET) : $(TEMP) $(OBJS)
	$(CC) $(LFLAGS) -o $@ $(OBJS) 
	