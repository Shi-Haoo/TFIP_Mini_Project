package miniProject.server.security.jwt;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import miniProject.server.exception.JwtTokenMissingException;
import miniProject.server.security.authServices.UserAuthService;
import miniProject.server.vo.UserVo;

//JwtAuthenticationFilter is one of the security filter we customized and the HTTP requests will go through
//The jwtAuthenticationFilter is responsible for parsing and validating JWT tokens provided in the request. 
//It extracts the token from the request, verifies its authenticity and integrity, and performs any additional 
//validation required (e.g., checking token expiration). If the token is valid, the filter sets the authenticated 
//user in the security context. User will be considered authenticated, and subsequent filters and processing will 
//be performed based on the authenticated user's authorities.
//@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter{
    
    @Autowired
	private JwtUtil jwtUtil;

	@Autowired
	private UserAuthService userAuthService;

    @Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		// Get the requested URL
        String requestUrl = request.getRequestURI();

        logger.info("Authenticating request for URL: " + requestUrl);
		
		if(!"/".equals(requestUrl)&& !"/favicon.ico".equals(requestUrl) && !"/index.html".equals(requestUrl)){

			//if(!"/favicon.ico".equals(requestUrl)){

			
		logger.info("Authenticating request for URL with JWT: " + requestUrl);

		String header = request.getHeader("Authorization");

		if (header == null || !header.startsWith("Bearer")) {
			throw new JwtTokenMissingException("No JWT token found in the request headers");
		}

		String token = header.substring(7);

		// Optional - verification
		jwtUtil.validateToken(token);

		UserVo userVo = jwtUtil.getUserDataFromToken(token);

		UserDetails userDetails = userAuthService.loadUserByUsername(userVo.getUsername());

		UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
				userDetails, null, userDetails.getAuthorities());

        //create an Authentication object with the AuthenticationToken
		usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

		if (SecurityContextHolder.getContext().getAuthentication() == null) {
			SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
		}

		//}

	}

		// Log the next filter in the chain
		logger.info("Next filter: " + filterChain.getClass().getSimpleName());
		filterChain.doFilter(request, response);
	
}
}