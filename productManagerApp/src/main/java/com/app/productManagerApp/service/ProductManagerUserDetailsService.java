package com.app.productManagerApp.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.app.productManagerApp.model.User;
import com.app.productManagerApp.model.UserPrinciple;
import com.app.productManagerApp.repository.UserRepo;

@Service
public class ProductManagerUserDetailsService implements UserDetailsService {

    UserRepo userRepo;

    public ProductManagerUserDetailsService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        
        User user = userRepo.findByUserName(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }
        
        return new UserPrinciple(user);

    }

}
