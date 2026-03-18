package com.collabflow.domain.user.mapper;


import com.collabflow.domain.user.dto.UserResponse;
import com.collabflow.domain.user.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(source = "id", target = "id")
    @Mapping(source = "username", target = "username")
    @Mapping(source = "email", target = "email")
    @Mapping(source = "displayName", target = "displayName")
    @Mapping(source = "avatarUrl", target = "avatarUrl")
    @Mapping(source = "bio", target = "bio")
    public UserResponse toDto(User user);
}
