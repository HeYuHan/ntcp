CC = g++
#yum install zlib-devel
#yum install zlib

LFLAGS = -m64 -lv8_libplatform -lv8 -L/opt/software/glibc-2.14/lib
LFLAGS += -ldl -lpthread -lrt -lz
CFLAGS = -c -fPIC -std=gnu++14

PF = LINUX
RAKNET_SOURCE_DIR = ../../3rd/RakNet
#SPIDERMONKEY_HEAD_DIR = ../../3rd/spidermonkey/include/linux
#SPIDERMONKEY_LIB = ../../3rd/spidermonkey/prebuilt/linux/64-bit/libjs_static.a
V8_INCLUDE = ../../3rd/v82/linux

#V8_LIBS = ../../3rd/v82/lib/libv8platform.a
#V8_LIBS += ../../3rd/v82/lib/libv8base.a
#V8_LIBS += ../../3rd/v82/lib/libc++.a
#V8_LIBS += ../../3rd/v82/linux/lib/libv8_init.a
#V8_LIBS += ../../3rd/v82/linux/lib/libv8_initializers.a

#V8_LIBS += ../../3rd/v82/lib/libv8_libplatform.a
#V8_LIBS += ../../3rd/v82/linux/lib/libv8_libsampler.a
#V8_LIBS += ../../3rd/v82/linux/lib/libv8_nosnapshot.a

COMMON_LIB = ../lib/libcommon.a
TARGET = ../bin/channelserver
SOURCES = $(wildcard *.cpp)
OBJS = $(patsubst %.cpp,objs/%.o,$(SOURCES)) $(SPIDERMONKEY_LIB) $(V8_LIBS)  $(COMMON_LIB)


ifneq ($(shell uname), Linux) 
	PF = MACOS
else
	LFLAGS += -lrt
endif

CFLAGS += -D$(PF)
CFLAGS += -DV8_ENGINE

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
CFLAGS += -I./$(V8_INCLUDE)
CFLAGS += -I/usr/local


#DEPS = $(patsubst %.cpp,objs/%.d,$(SOURCES))


default : $(TARGET)

objs/%.o: %.cpp
	$(CC) $(CFLAGS) -o $@ $<

#-include $(DEPS)

clean :
	rm -f $(TARGET) objs/*.o

$(TARGET) : $(TEMP) $(OBJS)
	$(CC) $(LFLAGS) -o $@ $(OBJS) 
	