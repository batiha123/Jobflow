package com.team.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class LogoResourceConfig implements WebMvcConfigurer {

    private final String logoResourceLocation;

    public LogoResourceConfig(@Value("${app.upload.logo-dir:./uploads/logos}") String logoDirectory) {
        String location = Path.of(logoDirectory).toAbsolutePath().normalize().toUri().toString();
        this.logoResourceLocation = location.endsWith("/") ? location : location + "/";
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/logos/**")
                .addResourceLocations(logoResourceLocation);
    }
}
