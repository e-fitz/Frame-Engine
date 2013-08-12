package com.frameengine;

import java.io.IOException;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.res.AssetFileDescriptor;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.MediaPlayer.OnPreparedListener;
import android.media.SoundPool;
import android.media.SoundPool.OnLoadCompleteListener;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;
import android.util.Log;

public class Sound implements OnLoadCompleteListener {
	private Context context;
	private String path;
	private boolean enabled = true;

	public static String EXTRA_PATH = "path";
	public static String EXTRA_LOOP = "loop";
	public static final int ACTION_START = 0;
	public static final int ACTION_STOP = 1;
	public static final int ACTION_RESTART = 2;
	private SoundPool pool = new SoundPool(10, AudioManager.STREAM_MUSIC, 0);
	private BackgroundSoundService backgroundMusic = new BackgroundSoundService();
	private Intent svc;
	Messenger mService;

	public Sound(Context c) {
		context = c;
		context.bindService(new Intent(context, BackgroundSoundService.class),
				mConnection, Context.BIND_AUTO_CREATE);
	}

	/**
	 * Play the sound instance
	 **/
	public int play(final String path) {
		if (!enabled) return 0;
		try {
			AssetFileDescriptor afd = context.getAssets().openFd(path + ".mp3");
			pool.load(afd, 0);
			pool.setOnLoadCompleteListener(this);
		} catch (IllegalArgumentException e) {
			Log.e("debug", e.getMessage());
		} catch (IllegalStateException e) {
			Log.e("debug", e.getMessage());
		} catch (IOException e) {
			Log.e("debug", e.getMessage());
		}

		return 0;
	}

	/**
	 * Play the sound instance
	 **/
	public int playMusic(final String path, final boolean loop) {
		if (!enabled) return 0;
		try {
			Message msg = Message.obtain(null, ACTION_START);
			msg.obj = path;
			msg.arg1 = (loop)?1:0;
			mService.send(msg);

		} catch (RemoteException e) {
			Log.e("debug",e.getMessage());
		}
		return 0;
	}

	public void stopMusic() {
		Message msg = Message.obtain(null, ACTION_STOP);
		try {
			if (mService != null){
				mService.send(msg);
			}
		} catch (RemoteException e) {
			
		}
	}

	public void startMusic() {
		if (!enabled) return;
		Message msg = Message.obtain(null, ACTION_RESTART);
		try {
			if (mService != null){
				mService.send(msg);
			}
		} catch (RemoteException e) {
			
		}
		
	}

	public void enable(){
		enabled = true;
	}
	
	public boolean isEnabled(){
		return enabled;
	}
	
	public void disable(){
		enabled = false;
		Message msg = Message.obtain(null, ACTION_STOP);
		try {
			if (mService != null){
				mService.send(msg);
			}
		} catch (RemoteException e) {
			
		}
	}
	
	/**
	 * Stop the sound
	 **/
	public void stop(int id) {
		
	}

	public void stopAll() {
		
	}

	public void onLoadComplete(SoundPool pool, int soundId, int success) {
		if (success == 0)
			pool.play(soundId, 1, 1, 0, 0, 1);
	}

	private ServiceConnection mConnection = new ServiceConnection() {
		public void onServiceConnected(ComponentName className, IBinder service) {
			mService = new Messenger(service);
		}

		public void onServiceDisconnected(ComponentName className) {
			mService = null;
		}
	};

}
