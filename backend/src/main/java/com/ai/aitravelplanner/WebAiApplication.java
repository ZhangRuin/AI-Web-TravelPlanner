package com.ai.aitravelplanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WebAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebAiApplication.class, args);
    }

}
//Invoke-WebRequest -Uri "http://localhost:8081/api/user/login" -Method POST -Body @{username='test';password='test'} -ContentType 'application/x-www-form-urlencoded'
