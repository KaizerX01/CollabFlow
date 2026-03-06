package com.collabflow.domain.chat.mapper;

import com.collabflow.domain.chat.dto.ChatMessageResponse;
import com.collabflow.domain.chat.model.ChatMessage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ChatMessageMapper {

    @Mapping(source = "project.id", target = "projectId")
    @Mapping(source = "sender.id", target = "senderId")
    @Mapping(source = "sender.username", target = "senderUsername")
    ChatMessageResponse toResponse(ChatMessage message);
}
