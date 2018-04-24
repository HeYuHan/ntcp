package com.coder.ntcp;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import com.coder.ntcp.db.CurrencyType;
import com.coder.ntcp.db.DBHelper;
import com.coder.ntcp.db.Room;
import com.coder.ntcp.db.RoomCard;


@SpringBootApplication
@EnableScheduling
public class NtcpApplication implements ApplicationListener<ContextRefreshedEvent> {
	private static final Logger logeer = LoggerFactory.getLogger(NtcpApplication.class);
	@Autowired
	GConfig config;
	@Autowired
	DBHelper dbHelper;
	
	public static void main(String[] args) {
		SpringApplication.run(NtcpApplication.class, args);
	}
	@Scheduled(fixedRate=2*60*60*1000)
	void cleanRooms() {
		List<Room> cleaned = dbHelper.cleanRoomCardByHour(config.clean_room_hour);
		if(cleaned == null)return;
		for(int i=0;i<cleaned.size();i++) {
			Room r = cleaned.get(i);
			logeer.info("Clean Room:"+r.getRoomId());
			System.out.println("Clean Room:"+r.getRoomId());
		}
	}
	@Override
	public void onApplicationEvent(ContextRefreshedEvent event) {
		// TODO Auto-generated method stub
		dbHelper.cleanRoomCardByHour(config.clean_room_hour);
		List<RoomCard> cards = dbHelper.getRecoveryRoomCard(config.clean_room_hour);
		for(int i=0;i<cards.size();i++) {
			RoomCard card = cards.get(i);
			boolean r = Room.RecoverRoom(card);
			logeer.info("Recovery Room:"+card.roomid +" ret:"+r);
			System.out.println("Recovery Room:"+card.roomid +" ret:"+r);
		}
		
	}
	
}
