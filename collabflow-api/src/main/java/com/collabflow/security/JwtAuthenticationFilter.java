package com.collabflow.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import org.springframework.util.StringUtils;


@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;


    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();

        System.out.println("🌐 Incoming request: " + path);

        if (path.startsWith("/api/auth/") || path.startsWith("/actuator/")) {
            System.out.println("✅ Bypassing JWT filter for: " + path);
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = parseJwt(request);
        System.out.println("🔑 JWT Token present: " + (jwt != null));

        if (jwt != null) {
            boolean isValid = jwtUtils.validateJwtToken(jwt);
            System.out.println("✔️ JWT Valid: " + isValid);

            if (isValid) {
                if (!jwtUtils.isAccessToken(jwt)) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
                try {
                    String username = jwtUtils.getUsernameFromJwt(jwt);
                    System.out.println("👤 Username from JWT: " + username);

                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    System.out.println("📋 Authorities: " + userDetails.getAuthorities());

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    SecurityContextHolder.getContext().setAuthentication(auth);
                    System.out.println("✅ Authentication set successfully!");

                } catch (Exception e) {
                    System.err.println("❌ Error setting authentication: " + e.getMessage());
                    e.printStackTrace();
                }
            }
        }

        System.out.println("🔓 Current authentication: " +
                SecurityContextHolder.getContext().getAuthentication());

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }


}
