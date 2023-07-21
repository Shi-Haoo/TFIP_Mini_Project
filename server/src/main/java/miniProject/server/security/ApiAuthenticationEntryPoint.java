package miniProject.server.security;

import java.io.IOException;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

//any Authentication error will be handled by this ApiAuthenticationEntryPoint.
//i.e: invalid password, invalid/null jwt token etc
@Component
public class ApiAuthenticationEntryPoint implements AuthenticationEntryPoint{
    
    //We override this method. Else it will always redirect to login page if there is Authentication error
    @Override
	public void commence(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException authException) throws IOException, ServletException {
		response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
	}

}
