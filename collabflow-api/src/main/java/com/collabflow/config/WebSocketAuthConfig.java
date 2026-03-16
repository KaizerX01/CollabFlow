package com.collabflow.config;

import com.collabflow.domain.presence.service.PresenceService;
import com.collabflow.security.CustomUserDetails;
import com.collabflow.security.CustomUserDetailsService;
import com.collabflow.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.List;

/**
 * Intercepts STOMP CONNECT frames to authenticate the user via JWT.
 *
 * The client must send the JWT as a STOMP header:
 * <pre>
 *   Authorization: Bearer &lt;token&gt;
 * </pre>
 *
 * On successful validation the {@link org.springframework.security.core.Authentication}
 * principal is set on the STOMP session so that downstream @MessageMapping controllers
 * can access it via {@code @AuthenticationPrincipal}.
 */
@Slf4j
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketAuthConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;
    private final PresenceService presenceService;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    if (accessor.getUser() != null) {
                        return message;
                    }

                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    String token = null;

                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        token = authHeader.substring(7);
                    }

                    if (token == null) {
                        token = extractAccessTokenFromCookieHeader(accessor.getNativeHeader("cookie"));
                    }
                    if (token == null) {
                        token = extractAccessTokenFromCookieHeader(accessor.getNativeHeader("Cookie"));
                    }

                    if (token != null && jwtUtils.validateJwtToken(token) && jwtUtils.isAccessToken(token)) {
                        String username = jwtUtils.getUsernameFromJwt(token);
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );

                        accessor.setUser(auth);
                        CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
                        presenceService.markSessionOnline(customUserDetails.getUser().getId(), accessor.getSessionId());
                        log.info("✅ WebSocket CONNECT authenticated for user: {}", username);
                    } else {
                        log.warn("❌ WebSocket CONNECT rejected – missing or invalid access token");
                        throw new IllegalArgumentException("Missing or invalid access token");
                    }
                }

                return message;
            }
        });
    }

    private String extractAccessTokenFromCookieHeader(List<String> cookieHeaders) {
        if (cookieHeaders == null) {
            return null;
        }
        for (String header : cookieHeaders) {
            if (header == null || header.isBlank()) {
                continue;
            }
            String[] segments = header.split(";");
            for (String segment : segments) {
                String trimmed = segment.trim();
                if (trimmed.startsWith("accessToken=")) {
                    String value = trimmed.substring("accessToken=".length()).trim();
                    return value.isBlank() ? null : value;
                }
            }
        }
        return null;
    }
}
