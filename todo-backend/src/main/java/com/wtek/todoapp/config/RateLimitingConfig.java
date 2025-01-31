package com.wtek.todoapp.config;

import com.wtek.todoapp.security.filters.RateLimitingFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class RateLimitingConfig {

    @Bean
    public RateLimitingFilter rateLimitingFilterBean(
            @Value("${app.rate-limiting.capacity:10}") int capacity,
            @Value("${app.rate-limiting.refill-rate:1}") double refillRate
    ) {
        return new RateLimitingFilter(capacity, refillRate);
    }

    @Bean
    public FilterRegistrationBean<RateLimitingFilter> rateLimitingFilterRegistration(RateLimitingFilter rateLimitingFilter) {
        FilterRegistrationBean<RateLimitingFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(rateLimitingFilter);  // Use the bean
        registrationBean.addUrlPatterns("/api/*");
        registrationBean.setOrder(1);
        return registrationBean;
    }
}
