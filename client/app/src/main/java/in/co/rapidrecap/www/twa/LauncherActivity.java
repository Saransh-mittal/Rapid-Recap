package in.co.rapidrecap.www.twa;

import android.content.pm.ActivityInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.ImageView;

import androidx.browser.customtabs.CustomTabsCallback;

public class LauncherActivity
        extends com.google.androidbrowserhelper.trusted.LauncherActivity {

    private ImageView splashScreen;
    private boolean isTwaLoaded = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        setTheme(R.style.SplashTheme);
        super.onCreate(savedInstanceState);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            getWindow()
                    .getAttributes().layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }

        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);

        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);

        // Create an ImageView to hold the splash screen drawable
        splashScreen = new ImageView(this);
        splashScreen.setImageDrawable(getDrawable(R.drawable.splash_screen));
        splashScreen.setScaleType(ImageView.ScaleType.CENTER);
        addContentView(splashScreen, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT));
    }

    @Override
    protected Uri getLaunchingUrl() {
        return Uri.parse("https://www.rapidrecap.co.in");
    }

    @Override
    protected CustomTabsCallback getCustomTabsCallback() {
        return new CustomTabsCallback() {
            @Override
            public void onNavigationEvent(int navigationEvent, Bundle extras) {
                if (navigationEvent == CustomTabsCallback.NAVIGATION_FINISHED) {
                    isTwaLoaded = true;
                    runOnUiThread(() -> removeSplashScreen());
                }
            }
        };
    }

    private void removeSplashScreen() {
        if (splashScreen != null && splashScreen.getParent() instanceof ViewGroup) {
            splashScreen.animate()
                    .alpha(0f)
                    .setDuration(300)
                    .withEndAction(() -> {
                        if (splashScreen.getParent() instanceof ViewGroup) {
                            ((ViewGroup) splashScreen.getParent()).removeView(splashScreen);
                        }
                        splashScreen = null;
                    })
                    .start();
        }
    }

    @Override
    public void onBackPressed() {
        if (!isTwaLoaded) {
            return;
        }
        super.onBackPressed();
    }
}
