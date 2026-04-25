import { Button, type ButtonProps } from '@afk/component';

export const OnboardingNext = ({ style, ...props }: ButtonProps) => {
  return (
    <Button
      style={{
        backgroundColor: 'black',
        color: 'white',
        height: 40,
        width: 200,
        fontWeight: 500,
        fontSize: 14,
        ...style,
      }}
      {...props}
    />
  );
};
