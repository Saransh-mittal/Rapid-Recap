package in.co.rapidrecap.www.twa;

import android.content.pm.ActivityInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;

public class LauncherActivity
        extends com.google.androidbrowserhelper.trusted.LauncherActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Apply the splash screen theme before calling super.onCreate()
        setTheme(R.style.SplashTheme);

        super.onCreate(savedInstanceState);

        // Set the content view to your splash screen layout
        setContentView(R.layout.activity_splash);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            getWindow().getAttributes().layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }

        // Hide system UI for true fullscreen experience
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);

        // Set orientation
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);

        // Find the ImageView for the "Rapid Recap" text and apply the fade-in animation
        ImageView rapidRecapText = findViewById(R.id.rapid_recap_text);
        if (rapidRecapText != null) {
            rapidRecapText.setVisibility(View.VISIBLE);
            Animation fadeIn = AnimationUtils.loadAnimation(this, R.anim.fade_in);
            rapidRecapText.startAnimation(fadeIn);
        }

        // Optional: Add a delay before proceeding to the main content
        new android.os.Handler().postDelayed(
            new Runnable() {
                @Override
                public void run() {
                    // This method will be executed once the timer is over
                    // You can add any additional logic here before proceeding
                    LauncherActivity.this.proceed();
                }
            },
            3000 // 3000 milliseconds delay
        );
    }

    @Override
    protected Uri getLaunchingUrl() {
        // Get the original launch Url.
        Uri uri = super.getLaunchingUrl();
        return uri;
    }

    private void proceed() {
        // Add any final logic here before proceeding to the main content
        // For example, you might want to fade out the splash screen
        // or perform any final checks

        // Then call the method to launch the main content
        launchMainContent();
    }

    private void launchMainContent() {
        // This method should contain the logic to launch your main content
        // It might involve starting a new activity or loading a URL
        // For a TWA, you might not need to do anything extra here
        // as the parent class might handle launching the main content
    }
}
