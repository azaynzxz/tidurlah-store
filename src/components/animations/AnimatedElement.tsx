import { useEffect, useRef, useState } from 'react';

interface AnimatedElementProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  className?: string;
}

export const AnimatedElement = ({ 
  children, 
  delay = 0, 
  duration = 300,
  direction = 'up',
  className = ''
}: AnimatedElementProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set initial state immediately to prevent flash
    setIsInitialized(true);
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px'
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay]);

  const getInitialTransform = () => {
    switch (direction) {
      case 'up':
        return 'translateY(30px)';
      case 'down':
        return 'translateY(-30px)';
      case 'left':
        return 'translateX(30px)';
      case 'right':
        return 'translateX(-30px)';
      case 'fade':
        return 'translateY(0px)';
      default:
        return 'translateY(30px)';
    }
  };

  const getFinalTransform = () => {
    return direction === 'fade' ? 'translateY(0px)' : 'translateY(0px) translateX(0px)';
  };

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        opacity: isInitialized ? (isVisible ? 1 : 0) : 0,
        transform: isInitialized ? (isVisible ? getFinalTransform() : getInitialTransform()) : getInitialTransform(),
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
      }}
    >
      {children}
    </div>
  );
};

// Staggered animation wrapper for multiple elements
interface StaggeredContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggeredContainer = ({ 
  children, 
  staggerDelay = 50,
  className = ''
}: StaggeredContainerProps) => {
  const childrenArray = Array.isArray(children) ? children : [children];
  
  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <AnimatedElement
          key={index}
          delay={index * staggerDelay}
          direction="up"
        >
          {child}
        </AnimatedElement>
      ))}
    </div>
  );
};

// Loading skeleton component
export const ProductSkeleton = () => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm flex flex-col h-full">
      <div className="relative pt-[100%] skeleton"></div>
      <div className="p-3 space-y-2">
        <div className="h-4 skeleton rounded w-3/4"></div>
        <div className="h-3 skeleton rounded w-1/2"></div>
        <div className="h-6 skeleton rounded w-1/3"></div>
      </div>
    </div>
  );
};

// Loading state component
interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeletonCount?: number;
}

export const LoadingState = ({ 
  isLoading, 
  children, 
  skeletonCount = 8 
}: LoadingStateProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  return <>{children}</>;
};
