package miniProject.server.vo;

import jakarta.json.Json;
import jakarta.json.JsonObject;

//used to store data to send it back to client
//In this case each user has only one role
public class JwtResponse {
    
    private String username;
    private String token;
    private String userRole;
    
    public JwtResponse() {
    }

    public JwtResponse(String username, String token, String userRole) {
        this.username = username;
        this.token = token;
        this.userRole = userRole;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    @Override
    public String toString() {
        return "JwtResponse [username=" + username + ", token=" + token + ", userRole=" + userRole + "]";
    }

    public JsonObject toJson(){

        return Json.createObjectBuilder()
                .add("username",this.getUsername())
                .add("token", this.getToken())
                .add("userRole", this.getUserRole())
                .build();
    }

    

}
