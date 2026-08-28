const fs = require('fs');
const glob = require('glob');

const paths = [
  'src/screens/onboarding/OnboardingCarousel.jsx',
  'src/screens/main/HomeScreen.jsx',
  'src/screens/auth/AuthBottomSheetModal.jsx',
  'src/navigation/MainTabs.jsx',
  'src/components/SkeletonLoader.jsx'
];

paths.forEach(p => {
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/const (\w+) = useRef\(new Animated\.Value\(([^)]+)\)\)\.current;/g, 'const [$1] = React.useState(() => new Animated.Value($2));');
    fs.writeFileSync(p, content);
    console.log('Fixed', p);
  }
});
