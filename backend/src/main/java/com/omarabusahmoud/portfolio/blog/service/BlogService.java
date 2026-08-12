package com.omarabusahmoud.portfolio.blog.service;

import java.text.Normalizer;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import com.omarabusahmoud.portfolio.blog.dto.BlogCommentResponse;
import com.omarabusahmoud.portfolio.blog.dto.BlogLikeResponse;
import com.omarabusahmoud.portfolio.blog.dto.BlogPostDetailResponse;
import com.omarabusahmoud.portfolio.blog.dto.BlogPostSummaryResponse;
import com.omarabusahmoud.portfolio.blog.dto.UpsertBlogPostRequest;
import com.omarabusahmoud.portfolio.blog.entity.BlogCommentEntity;
import com.omarabusahmoud.portfolio.blog.entity.BlogCommentLikeEntity;
import com.omarabusahmoud.portfolio.blog.entity.BlogPostEntity;
import com.omarabusahmoud.portfolio.blog.entity.BlogPostLikeEntity;
import com.omarabusahmoud.portfolio.blog.repository.BlogCommentLikeRepository;
import com.omarabusahmoud.portfolio.blog.repository.BlogCommentRepository;
import com.omarabusahmoud.portfolio.blog.repository.BlogPostLikeRepository;
import com.omarabusahmoud.portfolio.blog.repository.BlogPostRepository;
import com.omarabusahmoud.portfolio.guestbook.entity.GuestbookUserEntity;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BlogService {
    private final BlogPostRepository posts;
    private final BlogCommentRepository comments;
    private final BlogPostLikeRepository postLikes;
    private final BlogCommentLikeRepository commentLikes;
    private final Clock clock;

    public BlogService(BlogPostRepository posts, BlogCommentRepository comments,
            BlogPostLikeRepository postLikes, BlogCommentLikeRepository commentLikes, Clock clock) {
        this.posts = posts;
        this.comments = comments;
        this.postLikes = postLikes;
        this.commentLikes = commentLikes;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<BlogPostSummaryResponse> publicPosts() {
        return posts.findAllByPublishedTrueOrderByPublishedAtDescCreatedAtDesc()
                .stream().map(this::summary).toList();
    }

    @Transactional(readOnly = true)
    public List<BlogPostSummaryResponse> adminPosts() {
        return posts.findAllByOrderByCreatedAtDesc().stream().map(this::summary).toList();
    }

    @Transactional(readOnly = true)
    public BlogPostDetailResponse detail(String slug, GuestbookUserEntity viewer, boolean owner) {
        BlogPostEntity post = posts.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog post was not found"));
        if (!post.isPublished() && !owner) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog post was not found");
        }
        return detail(post, viewer);
    }

    @Transactional
    public BlogPostDetailResponse create(UpsertBlogPostRequest request) {
        Instant now = clock.instant();
        BlogPostEntity post = new BlogPostEntity(UUID.randomUUID(), request, uniqueSlug(request.title(), null), now);
        return detail(posts.saveAndFlush(post), null);
    }

    @Transactional
    public BlogPostDetailResponse update(UUID id, UpsertBlogPostRequest request) {
        BlogPostEntity post = findPost(id);
        post.apply(request, uniqueSlug(request.title(), id), clock.instant());
        return detail(posts.saveAndFlush(post), null);
    }

    @Transactional
    public void deletePost(UUID id) {
        posts.delete(findPost(id));
    }

    @Transactional
    public BlogLikeResponse togglePostLike(UUID postId, GuestbookUserEntity user) {
        BlogPostEntity post = findPublishedPost(postId);
        if (postLikes.existsByPostIdAndUserId(post.getId(), user.getId())) {
            postLikes.deleteByPostIdAndUserId(post.getId(), user.getId());
            return new BlogLikeResponse(postLikes.countByPostId(post.getId()), false);
        }
        postLikes.saveAndFlush(new BlogPostLikeEntity(post, user, clock.instant()));
        return new BlogLikeResponse(postLikes.countByPostId(post.getId()), true);
    }

    @Transactional
    public long recordShare(UUID postId) {
        BlogPostEntity post = findPublishedPost(postId);
        post.incrementShareCount();
        return posts.saveAndFlush(post).getShareCount();
    }

    @Transactional
    public BlogCommentResponse createComment(UUID postId, GuestbookUserEntity user, String rawContent) {
        BlogPostEntity post = findPublishedPost(postId);
        BlogCommentEntity comment = comments.saveAndFlush(new BlogCommentEntity(
                UUID.randomUUID(), post, user, normalizeComment(rawContent), clock.instant()));
        return commentResponse(comment, user);
    }

    @Transactional
    public BlogLikeResponse toggleCommentLike(UUID commentId, GuestbookUserEntity user) {
        BlogCommentEntity comment = findVisibleComment(commentId);
        if (commentLikes.existsByCommentIdAndUserId(commentId, user.getId())) {
            commentLikes.deleteByCommentIdAndUserId(commentId, user.getId());
            return new BlogLikeResponse(commentLikes.countByCommentId(commentId), false);
        }
        commentLikes.saveAndFlush(new BlogCommentLikeEntity(comment, user, clock.instant()));
        return new BlogLikeResponse(commentLikes.countByCommentId(commentId), true);
    }

    @Transactional
    public void deleteComment(UUID commentId, GuestbookUserEntity user, boolean owner) {
        BlogCommentEntity comment = comments.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment was not found"));
        if (!owner && !comment.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot remove this comment");
        }
        comment.hide(clock.instant());
        comments.saveAndFlush(comment);
    }

    private BlogPostSummaryResponse summary(BlogPostEntity post) {
        return BlogPostSummaryResponse.from(
                post,
                postLikes.countByPostId(post.getId()),
                comments.countByPostIdAndHiddenFalse(post.getId()));
    }

    private BlogPostDetailResponse detail(BlogPostEntity post, GuestbookUserEntity viewer) {
        List<BlogCommentResponse> visibleComments = comments.findAllByPostIdAndHiddenFalseOrderByCreatedAtDesc(post.getId())
                .stream().map(comment -> commentResponse(comment, viewer)).toList();
        boolean liked = viewer != null && postLikes.existsByPostIdAndUserId(post.getId(), viewer.getId());
        return BlogPostDetailResponse.from(post, postLikes.countByPostId(post.getId()), liked, visibleComments);
    }

    private BlogCommentResponse commentResponse(BlogCommentEntity comment, GuestbookUserEntity viewer) {
        UUID viewerId = viewer == null ? null : viewer.getId();
        return BlogCommentResponse.from(
                comment,
                commentLikes.countByCommentId(comment.getId()),
                viewerId != null && commentLikes.existsByCommentIdAndUserId(comment.getId(), viewerId),
                viewerId != null && comment.getUser().getId().equals(viewerId));
    }

    private BlogPostEntity findPost(UUID id) {
        return posts.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog post was not found"));
    }

    private BlogPostEntity findPublishedPost(UUID id) {
        BlogPostEntity post = findPost(id);
        if (!post.isPublished()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog post was not found");
        return post;
    }

    private BlogCommentEntity findVisibleComment(UUID id) {
        BlogCommentEntity comment = comments.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment was not found"));
        if (comment.isHidden()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment was not found");
        return comment;
    }

    private String normalizeComment(String value) {
        String normalized = value.trim().replace("\r\n", "\n").replace('\r', '\n');
        if (normalized.length() < 2) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment is too short");
        return normalized;
    }

    private String uniqueSlug(String title, UUID existingId) {
        String base = slugify(title);
        String candidate = base;
        int suffix = 2;
        while (existingId == null ? posts.existsBySlug(candidate) : posts.existsBySlugAndIdNot(candidate, existingId)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }

    private String slugify(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return normalized.isBlank() ? "post" : normalized.substring(0, Math.min(normalized.length(), 140));
    }
}
