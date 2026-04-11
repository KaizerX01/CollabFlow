package com.collabflow.domain.common.exception;

import java.util.UUID;

public class VersionConflictException extends RuntimeException {

    private final String resourceType;
    private final UUID resourceId;
    private final Long expectedVersion;
    private final Long currentVersion;
    private final Object latestState;

    public VersionConflictException(
            String resourceType,
            UUID resourceId,
            Long expectedVersion,
            Long currentVersion,
            Object latestState
    ) {
        super("Version conflict for " + resourceType + " " + resourceId
                + ": expected " + expectedVersion + ", but server has " + currentVersion);
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.expectedVersion = expectedVersion;
        this.currentVersion = currentVersion;
        this.latestState = latestState;
    }

    public String getResourceType() {
        return resourceType;
    }

    public UUID getResourceId() {
        return resourceId;
    }

    public Long getExpectedVersion() {
        return expectedVersion;
    }

    public Long getCurrentVersion() {
        return currentVersion;
    }

    public Object getLatestState() {
        return latestState;
    }
}
