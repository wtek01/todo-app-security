package com.wtek.todoapp.util;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "test123";
        String encodedPassword = encoder.encode(rawPassword);
        System.out.println("Mot de passe encodé : " + encodedPassword);
    }
}