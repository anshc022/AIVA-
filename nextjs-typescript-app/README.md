# Next.js TypeScript 3D Landing Page

A modern Next.js application featuring TypeScript, 3D components with React Three Fiber, and Tailwind CSS.

## 🚀 Features

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library structure
- **React Three Fiber** for 3D graphics
- **3D Hero Component** with:
  - Dynamic animations
  - Post-processing effects (Bloom, N8AO, SMAA)
  - Responsive design
  - Interactive navigation

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx           # Home page
│   └── landing/
│       └── page.tsx       # 3D Landing page
├── components/
│   ├── ui/
│   │   └── void-hero.tsx  # 3D Hero component
│   ├── Header.tsx         # Header component
│   ├── Card.tsx          # Card component
│   └── index.ts          # Component exports
├── types/
│   └── index.ts          # TypeScript type definitions
└── utils/
    └── helpers.ts        # Utility functions
```

## 🛠️ Technologies Used

### Core Framework
- **Next.js 16** - React framework with App Router
- **TypeScript** - Static type checking
- **React 19** - UI library

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library structure

### 3D Graphics
- **three.js** - 3D graphics library
- **@react-three/fiber** - React renderer for three.js
- **@react-three/csg** - Constructive Solid Geometry
- **@react-three/postprocessing** - Post-processing effects
- **postprocessing** - Effects library

## 🎯 TypeScript Features Demonstrated

- ✅ Path mapping with `@/*` alias
- ✅ Type-safe component props and interfaces
- ✅ Utility functions with proper typing
- ✅ Custom type definitions
- ✅ Import/export from index files
- ✅ Client-side components with TypeScript
- ✅ 3D component integration with type safety

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd nextjs-typescript-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Main app: [http://localhost:3000](http://localhost:3000)
   - 3D Landing page: [http://localhost:3000/landing](http://localhost:3000/landing)

## 📄 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 3D Hero Component Usage

The `void-hero.tsx` component can be imported and used as follows:

```tsx
import { Hero } from "@/components/ui/void-hero";

const navigationLinks = [
  { name: 'HOME', href: '/' },
  { name: 'WORK', href: '/work' },
  { name: 'ABOUT', href: '/about' },
  { name: 'CONTACT', href: '/contact' }
];

export default function Page() {
  return (
    <Hero 
      title="Your Title Here"
      description="Your description here..."
      links={navigationLinks}
    />
  );
}
```

### Hero Component Props

```typescript
interface HeroProps {
  title: string;              // Main heading text
  description: string;        // Description text
  links: Array<{              // Navigation links
    name: string;
    href: string;
  }>;
}
```

## 🎮 3D Scene Features

- **Animated Geometry**: Rotating cube with sphere subtraction
- **Dynamic Lighting**: Multiple light sources with different colors
- **Post-processing**: 
  - Ambient Occlusion (N8AO)
  - Bloom effects
  - Anti-aliasing (SMAA)
- **Responsive Design**: Adapts to different screen sizes
- **Performance Optimized**: Efficient rendering and animations

## 🔧 Customization

### Modifying the 3D Scene

Edit `src/components/ui/void-hero.tsx`:

- **Animation Speed**: Modify delta multipliers in `useFrame`
- **Geometry**: Change shapes in the `Shape` component
- **Lighting**: Adjust lights in the `Environment` component
- **Effects**: Configure post-processing in `EffectComposer`

### Styling

The component uses Tailwind CSS classes and can be customized by:
- Modifying existing classes
- Adding new Tailwind utilities
- Updating the color scheme

## 📱 Responsive Design

The 3D hero component is fully responsive:
- Mobile: Simplified navigation and adjusted text sizes
- Desktop: Full navigation and larger text
- The 3D scene adapts to all screen sizes

## 🎯 Use Cases

Perfect for:
- Portfolio websites
- Creative agencies
- Product showcases
- Landing pages
- Interactive presentations
- Modern web applications

## 📋 Browser Support

- Chrome 80+
- Firefox 80+
- Safari 14+
- Edge 80+

**Note**: WebGL support required for 3D features.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

---

**Happy coding!** 🚀
