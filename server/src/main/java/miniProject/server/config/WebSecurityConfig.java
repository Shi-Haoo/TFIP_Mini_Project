package miniProject.server.config;

import javax.swing.Spring;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.RegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import miniProject.server.security.ApiAuthenticationEntryPoint;
import miniProject.server.security.authServices.UserAuthService;
import miniProject.server.security.jwt.JwtAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class WebSecurityConfig {
    
    @Autowired
	private UserAuthService userAuthService;

    @Autowired
	private ApiAuthenticationEntryPoint authenticationEntryPoint;

    @Bean
    public JwtAuthenticationFilter authenticationJwtTokenFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
    return (web) -> web.ignoring().requestMatchers("/api/public/**"); 
    }


    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
      DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
       
      authProvider.setUserDetailsService(userAuthService);
      authProvider.setPasswordEncoder(passwordEncoder());
   
      return authProvider;
    }


    //any request to url starting with /api/public/ will not be authenticated. Only those requests to url starting with /api/protected/ will be authenticated
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .exceptionHandling(exception -> exception.authenticationEntryPoint(authenticationEntryPoint))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth.requestMatchers("/api/public/**").permitAll()
        //.requestMatchers("/api/protected/**").permitAll()
        .anyRequest().authenticated());

        http.authenticationProvider(authenticationProvider());
        
        //JwtAuthenticationFilter will be added before UsernamePasswordAuthenticationFilter. 
        //When user first login, UsernamePasswordAuthenticationFilter processes the login request, 
        //validates the provided credentials, and creates an authentication object. Once user is successfully
        //validated, it will return jwt token which user will use for subsequent requests. JwtAuthenticationFilter
        //will intercept all these requests and validate the jwt token, extract user info from token and sets
        //authenticated user in the Security Context   
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    //Spring Boot automatically creates beans for us on the fly. As a result JwtAuthenticationFilter class was being automatically put into the  
    //filter chain by Spring Boot, and also being included in the Security filter chain when it was declared it in Spring Security config.
    //Although I specifically excluded /signin and /signup end-points in Spring Security config, that wasn’t enough to stop the filter from 
    //happening in the context of Spring Boot itself. The solution was to configure a bean that explicitly prevents it from being added by Spring Boot.
    //Without this RegistrationBean, JwtAuthenticationFilter will intercept for calls to /signup and /signin, requesting for JWT token
    @Bean
	public RegistrationBean jwtAuthFilterRegister(JwtAuthenticationFilter filter) {
		FilterRegistrationBean<JwtAuthenticationFilter> registrationBean = new FilterRegistrationBean<>(filter);
		registrationBean.setEnabled(false);
		return registrationBean;
	}


    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfiguration) throws Exception {
        return authConfiguration.getAuthenticationManager();
    }

    @Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
