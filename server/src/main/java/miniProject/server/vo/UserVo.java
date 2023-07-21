package miniProject.server.vo;




//used for storing data temporarily before passing it to classes in model to store into database
//Also used to  carry data around for jwt token generation etc
public class UserVo {
    
    private String username;
	private String password;
    private String email;
	private String userRole;
    
    public UserVo() {
    }

    
    public UserVo(String username, String password, String email, String userRole) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.userRole = userRole;
    }


    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getUserRole() {
        return userRole;
    }
    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }


    @Override
    public String toString() {
        return "UserVo [username=" + username + ", password=" + password + ", email=" + email + ", userRole=" + userRole
                + "]";
    }

    


    

    


    

    
    

}
