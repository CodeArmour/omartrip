package com.omarabusahmoud.portfolio.blog.entity;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class BlogPostLikeId implements Serializable {
    private UUID post;
    private UUID user;

    public BlogPostLikeId() { }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof BlogPostLikeId that)) return false;
        return Objects.equals(post, that.post) && Objects.equals(user, that.user);
    }

    @Override
    public int hashCode() {
        return Objects.hash(post, user);
    }
}
