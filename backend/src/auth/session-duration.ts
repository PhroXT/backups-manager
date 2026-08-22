export function sessionDurationToMs(
    duration: string,
): number {
    const match = duration.match(
        /^(\d+)([smhd])$/,
    );

    if (!match) {
        throw new Error(
            'Invalid SESSION_EXPIRES_IN format. Use values like 30m, 1h, 8h, or 1d.',
        );
    }

    const value = Number(match[1]);
    const unit = match[2];

    const multipliers: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
}