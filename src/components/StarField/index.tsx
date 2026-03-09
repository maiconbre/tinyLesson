import React from 'react';

// Componente de Estrelas Otimizado (Hydration Safe - Ultra Slow)
export const StarField = () => {
    const stars = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        top: `${(i * 19) % 100}%`,
        left: `${(i * 29) % 100}%`,
        size: (i % 5 === 0) ? 3 : 2,
        duration: `${25 + (i % 15)}s`,
        delay: `${(i * 3)}s`
    }));

    return (
        <div className="star-field">
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="star"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: star.size,
                        height: star.size,
                        '--duration': star.duration,
                        '--delay': star.delay,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
};
