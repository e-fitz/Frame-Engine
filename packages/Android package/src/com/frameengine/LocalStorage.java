package com.frameengine;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.preference.PreferenceManager;

public class LocalStorage {
	
	private SharedPreferences sp;
	private Editor e;
	
	public LocalStorage(Context context){
		sp = PreferenceManager.getDefaultSharedPreferences(context);
		e = sp.edit();
	}
	
	public String getItem(String key){
		return sp.getString(key, null);
	}
	
	public void setItem(String key, String value){
		e.putString(key, value);
		e.commit();
	}
	
	public void removeItem(String key){
		e.remove(key);
		e.commit();
	}
	
}
