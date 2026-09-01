export const sanitizeUser = (user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    provider: user.provider,
    providerId: user.providerId,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});