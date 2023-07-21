package miniProject.server.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import miniProject.server.models.User;
import miniProject.server.models.UserRole;

import static miniProject.server.repository.DBQueries.*;

import java.sql.PreparedStatement;
import java.util.Optional;

//repository to store all registered users and also users who are allowed to register for an account and their roles

@Repository
public class UserRepository {
    
    @Autowired
    JdbcTemplate sqlTemplate;

    public Optional<User> getUser(String username){
        
        SqlRowSet rs = sqlTemplate.queryForRowSet(GET_REGISTERED_USER_DETAILS, username);
        
        if(rs.first()){
            return Optional.of(User.createFromSqlResults(rs));
        }

        return Optional.empty();
    }

    
    public Optional<User> getUserByEmail(String email){

        SqlRowSet rs = sqlTemplate.queryForRowSet(GET_REGISTERED_USER_DETAILS_BY_EMAIL, email);
        
        if(rs.first()){
            return Optional.of(User.createFromSqlResults(rs));
        }

        return Optional.empty();
    }


    public Optional<UserRole> getRole(String email){
        
     SqlRowSet rs = sqlTemplate.queryForRowSet(GET_USER_ROLES, email);
    
     if(rs.first()){
        return Optional.of(UserRole.convertFromSqlRowSet(rs));
     }

     return Optional.empty();
    }

    //insert approved user into the registered_users table
    public void saveUser(User user){

        sqlTemplate.update(conn -> {
                PreparedStatement ps = conn.prepareStatement(INSERT_NEW_USER);
                ps.setString(1, user.getUsername());
                ps.setString(2, user.getPassword());
                ps.setString(3, user.getEmail());
                
                
                return ps;
            });

        }
    
}
