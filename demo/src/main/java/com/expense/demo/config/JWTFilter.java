package com.expense.demo.config;
import com.expense.demo.service.JWTService;
import com.expense.demo.service.MyUserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
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
@Component
public class JWTFilter extends OncePerRequestFilter {

    @Autowired
    private JWTService jwtService;

    @Autowired
    ApplicationContext context;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
//  Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJraWxsIiwiaWF0IjoxNzIzMTgzNzExLCJleHAiOjE3MjMxODM4MTl9.5nf7dRzKRiuGurN2B9dHh_M5xiu73ZzWPr6rbhOTTHs
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        // System.out.println();
        // System.out.println();
        // System.out.println();
        // System.out.println();
        // System.out.println("Authorization Header: " + authHeader); // For debugging

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            System.out.println("here");
            token = authHeader.substring(7);
            username = jwtService.extractUserName(token);
        }

        
        // System.out.println("Token extracted: " + token); // For debugging
        // System.out.println("Username extracted from token: " + username); // For debugging

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        
        UserDetails userDetails = context.getBean(MyUserDetailsService.class).loadUserByUsername(username);
        System.out.println("1. User found in DB: " + userDetails.getUsername());

        if (jwtService.validateToken(token, userDetails)) {
            System.out.println("2. Token is VALID! Setting Security Context..."); // <--- LOOK FOR THIS

            UsernamePasswordAuthenticationToken authToken = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
            
            System.out.println("3. User is now Authenticated in Spring Security");
        } else {
            System.out.println("❌ Token Validation FAILED for user: " + username);
        }
    }

        filterChain.doFilter(request, response);
    }
}