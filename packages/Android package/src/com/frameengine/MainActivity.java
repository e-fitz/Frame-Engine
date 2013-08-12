package com.frameengine;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.os.Bundle;
import android.util.Log;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings.RenderPriority;
import android.webkit.WebView;

public class MainActivity extends Activity  {

	private WebView webView;
	private Sound sound;
	
	@Override
	/** Called when the activity is first created. */
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
		setContentView(R.layout.activity_main);
		getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,WindowManager.LayoutParams.FLAG_FULLSCREEN);
		setupWebView();
	}

	/** Sets up the WebView object and loads the URL of the page **/
	private void setupWebView() {
		webView = (WebView) findViewById(R.id.webview);
		webView.getSettings().setJavaScriptEnabled(true);
		webView.getSettings().setAllowFileAccess(true);
		webView.getSettings().setPluginsEnabled(true);
		webView.getSettings().setAppCacheEnabled(false);
		webView.getSettings().setRenderPriority(RenderPriority.HIGH);
		webView.getSettings().setSupportZoom(false);
		webView.getSettings().setDomStorageEnabled(true);
		webView.setFocusableInTouchMode(true);
		webView.setWebChromeClient(new MyWebChromeClient());
        webView.setHorizontalScrollBarEnabled(false);
        webView.setVerticalScrollBarEnabled(false);
        sound = new Sound(this);
        webView.addJavascriptInterface(new LocalStorage(this), "androidStorage");
        webView.addJavascriptInterface(sound, "androidSound");
        
		try {
			BufferedReader istr = new BufferedReader(new InputStreamReader(getAssets().open("index.html")));
			StringBuilder sb = new StringBuilder();
			String tmp = "";
			while((tmp = istr.readLine()) != null){
				sb.append(tmp);
			}
			webView.loadDataWithBaseURL("file:///android_asset/", sb.toString(),null,"utf-8",null);
		
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@Override
	public void onPause(){
		super.onPause();
		webView.loadUrl("javascript:Engine.pause()");
		sound.stopMusic();
	}
	
	@Override
	public void onResume(){
		super.onResume();
		webView.loadUrl("javascript:Engine.start()");
		if (sound != null)
			sound.startMusic();
	}
	
	final class MyWebChromeClient extends WebChromeClient{
			
		public MyWebChromeClient() { 
		}
		
		public boolean onConsoleMessage(ConsoleMessage m){
			Log.e("debug","Source : " + m.sourceId() + ", line " + m.lineNumber() + " : " + m.message());
			return true;
		}
	}

	
}
