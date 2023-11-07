package com.example.rayzi.videocall;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.Toast;

import androidx.databinding.DataBindingUtil;

import com.example.rayzi.R;
import com.example.rayzi.activity.BaseActivity;
import com.example.rayzi.databinding.ActivityRandomMatchBinding;
import com.example.rayzi.modelclass.GuestProfileRoot;
import com.example.rayzi.retrofit.Const;
import com.example.rayzi.retrofit.RetrofitBuilder;
import com.google.gson.Gson;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RandomMatchActivity extends BaseActivity {
    ActivityRandomMatchBinding binding;

    private Animation zoomin;
    private Animation animZoomin;
    private GuestProfileRoot.User guestUser;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = DataBindingUtil.setContentView(this, R.layout.activity_random_match);


        binding.ivUser.setUserImage(sessionManager.getUser().getImage(), sessionManager.getUser().isIsVIP(), RandomMatchActivity.this);

        zoomin = AnimationUtils.loadAnimation(this, R.anim.zoomin);
        animZoomin = AnimationUtils.loadAnimation(getApplicationContext(), R.anim.zoomin);


        matchAgain();


        binding.btnMatch.setOnClickListener(v -> matchAgain());
        binding.btnCall.setOnClickListener(v -> makeACall());
    }

    private void makeACall() {
        onBackPressed();
        startActivity(new Intent(this, CallRequestActivity.class).putExtra(Const.USER, new Gson().toJson(guestUser)));
    }

    private void matchAgain() {
        binding.lytStatus.setText("Searching for new Friends...");

        binding.ivUser2.setVisibility(View.GONE);
        binding.btnCall.setVisibility(View.GONE);
        binding.btnMatch.setVisibility(View.GONE);
        binding.ivUser.startAnimation(animZoomin);
        binding.ivMatch.setVisibility(View.VISIBLE);

        Call<GuestProfileRoot> call = RetrofitBuilder.create().getRandomUser(sessionManager.getUser().getId());
        call.enqueue(new Callback<GuestProfileRoot>() {
            @Override
            public void onResponse(Call<GuestProfileRoot> call, Response<GuestProfileRoot> response) {
                if (response.code() == 200) {
                    if (response.body().isStatus() && response.body().getUser() != null) {
                        guestUser = response.body().getUser();
                        setGuestUser();
                    } else {
                        Toast.makeText(RandomMatchActivity.this, "No One Found Online", Toast.LENGTH_SHORT).show();
                        onBackPressed();
                    }
                }
            }

            @Override
            public void onFailure(Call<GuestProfileRoot> call, Throwable t) {

            }
        });
    }

    private void setGuestUser() {

        binding.ivUser2.setUserImage(guestUser.getImage(), guestUser.isVIP(), RandomMatchActivity.this);
        binding.lytStatus.setText("Matched with " + guestUser.getName());

        binding.ivUser.clearAnimation();
        binding.ivUser2.setVisibility(View.VISIBLE);
        binding.btnMatch.setVisibility(View.VISIBLE);
        binding.btnCall.setVisibility(View.VISIBLE);
        binding.ivMatch.setVisibility(View.GONE);


    }

    @Override
    protected void onPause() {
        super.onPause();
        onBackPressed();
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();

    }
}