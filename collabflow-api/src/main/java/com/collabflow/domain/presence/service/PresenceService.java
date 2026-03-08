package com.collabflow.domain.presence.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PresenceService {

    private static final String PRESENCE_ONLINE_PREFIX = "presence:user:";
    private static final String PRESENCE_CONNECTIONS_PREFIX = "presence:user-connections:";
    private static final String PRESENCE_SESSION_PREFIX = "presence:session:";

    @Value("${app.presence.session-ttl-seconds:7200}")
    private long sessionTtlSeconds;

    @Value("${app.presence.online-ttl-seconds:7200}")
    private long onlineTtlSeconds;

    private final StringRedisTemplate redis;

    public void markSessionOnline(UUID userId, String sessionId) {
        String userKey = userKey(userId);
        String connectionCountKey = connectionCountKey(userId);
        String sessionKey = sessionKey(sessionId);

        redis.opsForValue().set(sessionKey, userId.toString(), Duration.ofSeconds(sessionTtlSeconds));

        Long count = redis.opsForValue().increment(connectionCountKey);
        redis.expire(connectionCountKey, Duration.ofSeconds(sessionTtlSeconds));

        if (count != null && count > 0) {
            redis.opsForValue().set(userKey, "online", Duration.ofSeconds(onlineTtlSeconds));
        }
    }

    public void markSessionOffline(String sessionId) {
        String sessionKey = sessionKey(sessionId);
        String userId = redis.opsForValue().get(sessionKey);

        if (userId == null) {
            return;
        }

        UUID parsedUserId = UUID.fromString(userId);
        String userKey = userKey(parsedUserId);
        String connectionCountKey = connectionCountKey(parsedUserId);

        Long count = redis.opsForValue().decrement(connectionCountKey);

        if (count == null || count <= 0) {
            redis.delete(connectionCountKey);
            redis.delete(userKey);
        } else {
            redis.expire(connectionCountKey, Duration.ofSeconds(sessionTtlSeconds));
            redis.opsForValue().set(userKey, "online", Duration.ofSeconds(onlineTtlSeconds));
        }

        redis.delete(sessionKey);
    }

    public boolean isOnline(UUID userId) {
        Boolean present = redis.hasKey(userKey(userId));
        return Boolean.TRUE.equals(present);
    }

    public Map<UUID, Boolean> getOnlineStatus(Collection<UUID> userIds) {
        Map<UUID, Boolean> result = new LinkedHashMap<>();
        for (UUID userId : userIds) {
            result.put(userId, isOnline(userId));
        }
        return result;
    }

    private String userKey(UUID userId) {
        return PRESENCE_ONLINE_PREFIX + userId;
    }

    private String connectionCountKey(UUID userId) {
        return PRESENCE_CONNECTIONS_PREFIX + userId;
    }

    private String sessionKey(String sessionId) {
        return PRESENCE_SESSION_PREFIX + sessionId;
    }
}
