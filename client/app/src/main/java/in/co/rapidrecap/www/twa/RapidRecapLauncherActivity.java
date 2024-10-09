package in.co.rapidrecap.www.twa;

import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.FrameLayout;

import com.google.androidbrowserhelper.trusted.LauncherActivity;

public class RapidRecapLauncherActivity extends LauncherActivity {

    private View splashScreen;
    private static final long MIN_SPLASH_DURATION = 500; // milliseconds
    private long splashStartTime;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Set up full-screen immersive mode
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

        // Set up the splash screen
        splashScreen = new View(this);
        splashScreen.setBackgroundResource(R.drawable.splash_screen);
        addContentView(splashScreen, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT));

        splashStartTime = System.currentTimeMillis();

        // Schedule the removal of the splash screen
        new android.os.Handler().postDelayed(this::checkAndRemoveSplashScreen, MIN_SPLASH_DURATION);
    }

    @Override
    protected Uri getLaunchingUrl() {
        Uri uri = getIntent().getData();
        if (uri != null && uri.toString().startsWith("https://www.rapidrecap.co.in/article/")) {
            return uri;
        }
        return Uri.parse("https://www.rapidrecap.co.in");
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        if (intent.getData() != null) {
            launchTwa(intent.getData());
        }
    }

    private void launchTwa(Uri uri) {
        Intent intent = new Intent(this, getClass());
        intent.setData(uri);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
        finish();
    }

    @Override
    protected void onResume() {
        super.onResume();
        checkAndRemoveSplashScreen();
    }

    @Override
    public void onBackPressed() {
        if (splashScreen != null) {
            return;
        }
        super.onBackPressed();
    }

    private void checkAndRemoveSplashScreen() {
        long elapsedTime = System.currentTimeMillis() - splashStartTime;
        if (elapsedTime >= MIN_SPLASH_DURATION) {
            removeSplashScreen();
        } else {
            new android.os.Handler().postDelayed(this::removeSplashScreen, MIN_SPLASH_DURATION - elapsedTime);
        }
    }

    private void removeSplashScreen() {
        if (splashScreen != null && splashScreen.getParent() instanceof ViewGroup) {
            splashScreen.animate()
                    .alpha(0f)
                    .setDuration(300)
                    .withEndAction(() -> {
                        if (splashScreen != null && splashScreen.getParent() instanceof ViewGroup) {
                            ((ViewGroup) splashScreen.getParent()).removeView(splashScreen);
                        }
                        splashScreen = null;
                    })
                    .start();
        }
    }
}
