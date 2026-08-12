package com.omarabusahmoud.portfolio.blog.entity;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class BlogCommentLikeId implements Serializable {
    private UUID comment;
    private UUID user;

    public BlogCommentLikeId() { }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof BlogCommentLikeId that)) return false;
        return Objects.equals(comment, that.comment) && Objects.equals(user, that.user);
    }

    @Override
    public int hashCode() {
        return Objects.hash(comment, user);
    }
}
