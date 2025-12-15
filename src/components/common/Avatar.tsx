interface AvatarProps {
  avatar: string; // emoji
  avatarUrl?: string; // image URL
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-lg',
  md: 'w-10 h-10 text-2xl',
  lg: 'w-12 h-12 text-3xl',
  xl: 'w-16 h-16 text-4xl',
};

export default function Avatar({ avatar, avatarUrl, size = 'md', className = '' }: AvatarProps) {
  const sizeClass = sizeClasses[size];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt="프로필"
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClass} bg-gray-100 rounded-full flex items-center justify-center ${className}`}>
      {avatar}
    </div>
  );
}
