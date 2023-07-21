package miniProject.server.security.authServices;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import miniProject.server.models.User;
import miniProject.server.models.UserRole;
import miniProject.server.repository.UserRepository;


 @Service
 public class UserAuthService implements UserDetailsService{
    
    @Autowired
    private UserRepository userRepo;

    // @Autowired
    // private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException{
        
        Optional<User> userOpt = userRepo.getUser(username);

        if(userOpt.isEmpty()){
            throw new UsernameNotFoundException("User '"+username+"' not found.");
        }


        Optional<UserRole> userRoleOpt = userRepo.getRole(userOpt.get().getEmail());

        List<String> roles = new ArrayList<>();
        roles.add(userRoleOpt.get().getRole());

        List<GrantedAuthority> grantedAuthorities = roles.stream()
            .map(r -> {return new SimpleGrantedAuthority(r);})
            .collect(Collectors.toList());
        
            return new org.springframework.security.core.userdetails.User(userOpt.get().getUsername(), userOpt.get().getPassword(),
				grantedAuthorities);
    }

    //to check whether username in registered_users table alr exist. If exist, then user cannot sign up with this username
    public Optional<User> getUserByUsername(String username){

        return userRepo.getUser(username);

    }

    //to check whether email in registered_users table alr exist. If exist, then user cannot sign up with this email
    public Optional<User> getUserByEmail(String email){
        
        return userRepo.getUserByEmail(email);
    }

    //will be called to check whether applicant's email is in the approved_users table
    public Optional<UserRole> getEmailFromApprovedTable(String email){
        return userRepo.getRole(email);
    }

    public void saveUser(User user){

        //user.setPassword(passwordEncoder.encode(user.getPassword()));

        userRepo.saveUser(user);
    }
}
