package com.team.backend.service;

public interface CurrentUserProvider {

    /**
     * Returns the identifier of the currently authenticated user.
     *
     * @return the authenticated user's identifier
     */
    Long getCurrentUserId();
}
