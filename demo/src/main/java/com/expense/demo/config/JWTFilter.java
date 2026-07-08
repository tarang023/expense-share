package com.expense.demo.config;

import com.expense.demo.service.JWTService;
import com.expense.demo.service.MyUserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import org.springframework.lang.NonNull;

@Component
public class JWTFilter extends OncePerRequestFilter {

    @Autowired
    private JWTService jwtService;

    @Autowired
    ApplicationContext context;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String token = null;
        String username = null;

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            token = Arrays.stream(cookies)
                    .filter(c -> "jwt_token".equals(c.getName()))
                    .map(c -> c.getValue())
                    .findFirst()
                    .orElse(null);
        }

        if (token != null) {
            try {
                username = jwtService.extractUserName(token);
            } catch (Exception e) {
                System.out.println("JWT cookie parsing failed: " + e.getMessage());
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = context.getBean(MyUserDetailsService.class).loadUserByUsername(username);
            System.out.println("1. User found in DB: " + userDetails.getUsername());

            if (jwtService.validateToken(token, userDetails)) {
                System.out.println("2. Token is VALID! Setting Security Context...");

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);

                System.out.println("3. User is now Authenticated in Spring Security");
            } else {
                System.out.println("Token Validation FAILED for user: " + username);
            }
        }

        filterChain.doFilter(request, response);
    }
}