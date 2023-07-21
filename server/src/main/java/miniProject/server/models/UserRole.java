package miniProject.server.models;

import org.springframework.jdbc.support.rowset.SqlRowSet;

//to retrieve user role and email from approved_users table
public class UserRole {
    
    private String role;
    private String email;
    
    public UserRole() {
    }

    public UserRole(String role, String email) {
        this.role = role;
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public String toString() {
        return "UserRole [role=" + role + ", email=" + email + "]";
    }

    public static UserRole convertFromSqlRowSet(SqlRowSet rs){
        
        UserRole userRole = new UserRole();
        userRole.setEmail(rs.getString("email"));
        userRole.setRole(rs.getString("user_roles"));

        return userRole;
    }
}
