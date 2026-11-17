package com.urechki.crm_service.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Небольшое хеширование паролей без внешних зависимостей.
 * Формат хранимого значения: sha256$salt$hash.
 * Старые пароли в открытом виде продолжают работать и при входе обновляются.
 */
public final class PasswordUtil {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String PREFIX = "sha256$";

    private PasswordUtil() {
    }

    public static String hash(String rawPassword) {
        byte[] salt = new byte[16];
        RANDOM.nextBytes(salt);
        return PREFIX + Base64.getEncoder().encodeToString(salt) + "$" + digest(rawPassword, salt);
    }

    public static boolean matches(String rawPassword, String stored) {
        if (stored == null || rawPassword == null) return false;
        if (!stored.startsWith(PREFIX)) {
            // lecacy: открытый пароль из старой БД
            return stored.equals(rawPassword);
        }
        String[] parts = stored.split("\\$");
        if (parts.length != 3) return false;
        byte[] salt;
        try {
            salt = Base64.getDecoder().decode(parts[1]);
        } catch (IllegalArgumentException e) {
            return false;
        }
        return constantTimeEquals(digest(rawPassword, salt), parts[2]);
    }

    public static boolean needsUpgrade(String stored) {
        return stored != null && !stored.startsWith(PREFIX);
    }

    public static boolean isHashed(String stored) {
        return stored != null && stored.startsWith(PREFIX);
    }

    private static String digest(String rawPassword, byte[] salt) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt);
            byte[] bytes = md.digest(rawPassword.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 недоступен", e);
        }
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) result |= a.charAt(i) ^ b.charAt(i);
        return result == 0;
    }
}
