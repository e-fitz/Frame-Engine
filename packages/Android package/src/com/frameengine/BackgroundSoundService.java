package com.frameengine;

import static com.frameengine.Sound.ACTION_RESTART;
import static com.frameengine.Sound.ACTION_START;
import static com.frameengine.Sound.ACTION_STOP;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.MediaPlayer;
import android.media.MediaPlayer.OnPreparedListener;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;
import android.os.Messenger;

public class BackgroundSoundService extends Service { 
	final Messenger mMessenger = new Messenger(new IncomingHandler());
	private static final String TAG = "MyService";
	
	MediaPlayer player;		
	
	@Override	
	public IBinder onBind(Intent intent) {
		setForeground(true);
		return mMessenger.getBinder();
	}		
	
	@Override
	public void onCreate() {		
	
	}
	
	public void onUnbind(){
		player.stop();
		stopSelf();
	}
	
	@Override	
	public void onDestroy() {
		if (player != null){
			player.stop();
			player = null;
		}
	}		
	
	@Override	
	public int onStartCommand(Intent intent, int flags, int startId) {
		return super.onStartCommand(intent, flags, startId);
	}
	
	
	class IncomingHandler extends Handler {
        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case ACTION_START:
                	Context mContext = getApplicationContext();
                	String name = (String)msg.obj;
                	name = name.substring(name.lastIndexOf("/") + 1);
                	int i = mContext.getResources().getIdentifier(name,"raw", mContext.getPackageName());
                	player = MediaPlayer.create(BackgroundSoundService.this, i);
            		player.setLooping(msg.arg1 == 1); 
            		player.setVolume(100,100);
            		player.setOnPreparedListener(new OnPreparedListener() {
            			public void onPrepared(MediaPlayer mp) {
            				player.start();	
            			}
            		});
                    break;
                case ACTION_STOP:
                	if (player != null)
                		player.pause();
                	break;
                case ACTION_RESTART:
                	if (player != null)
                		player.start();
                	break;
                default:
                    super.handleMessage(msg);
            }
        }
    }
} 