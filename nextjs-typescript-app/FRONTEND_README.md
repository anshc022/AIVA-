# AIVA Frontend - Next.js TypeScript Application

## 🌟 **Complete Environmental Intelligence Dashboard**

A stunning Next.js 16 application with TypeScript that provides a comprehensive user interface for AIVA's environmental intelligence platform.

## 🚀 **Features**

### **🏠 Home Page**
- **3D Hero Component**: Stunning Three.js animation with breathing Earth effect
- **AIVA Branding**: Green intelligence theme with smooth gradients
- **Interactive Navigation**: Seamless routing to dashboard and other pages

### **📊 Dashboard Page**
- **Location Selection**: Custom coordinates or popular preset locations
- **Analysis Types**: Complete, Quick Scan, or Satellite Vision focus
- **Real-time Monitoring**: System health and API status tracking
- **Environmental Metrics**: Live display of air quality, weather, vegetation
- **AI Analysis Hub**: CNN Vision, Gemini AI insights, and recommendations
- **Satellite Viewer**: Real satellite imagery with CNN analysis overlay
- **Quick Actions FAB**: Floating action button for rapid location analysis

### **ℹ️ About Page**
- **Mission Statement**: AIVA's environmental consciousness message
- **Technology Stack**: Detailed breakdown of AI and data sources
- **Feature Highlights**: Key capabilities and benefits

## 🛠️ **Technology Stack**

### **Frontend Framework**
- **Next.js 16**: Latest React framework with app router
- **TypeScript**: Full type safety and developer experience
- **Tailwind CSS**: Utility-first styling with custom green theme

### **3D Graphics**
- **React Three Fiber**: React renderer for Three.js
- **Three.js**: 3D graphics and animations
- **Post-processing**: Bloom effects and visual enhancements

### **UI Components**
- **Custom Dashboard Components**: Location selector, analysis panels
- **Real-time Updates**: Live system monitoring and data refresh
- **Responsive Design**: Mobile-first approach with adaptive layouts

## 📁 **Project Structure**

```
src/
├── app/
│   ├── page.tsx                    # Home page with 3D hero
│   ├── dashboard/
│   │   └── page.tsx               # Main dashboard page
│   ├── about/
│   │   └── page.tsx               # About AIVA page
│   ├── layout.tsx                 # Root layout with metadata
│   └── globals.css                # Global styles and theme
├── components/
│   ├── ui/
│   │   ├── void-hero.tsx          # 3D Hero component
│   │   └── common.tsx             # Shared UI components
│   ├── layout/
│   │   └── Layout.tsx             # App layout with navigation
│   └── dashboard/
│       ├── EnvironmentalDashboard.tsx  # Main metrics display
│       ├── LocationSelector.tsx        # Location picker
│       ├── AIAnalysisPanel.tsx         # AI insights hub
│       ├── SatelliteViewer.tsx         # Satellite image viewer
│       ├── RealTimeMonitor.tsx         # System status monitor
│       └── QuickActionsPanel.tsx       # Floating action button
└── lib/
    └── demoData.ts                # Fallback demo data
```

## 🎯 **Key Components**

### **Environmental Dashboard**
- **Live Metrics**: Real-time environmental scores and indicators
- **Tabbed Interface**: Overview, Details, and Risk Assessment views
- **Score Visualization**: Color-coded health indicators and confidence levels
- **Data Integration**: Combines Traditional AI, CNN, and Gemini insights

### **AI Analysis Panel**
- **CNN Vision**: Satellite image analysis with vegetation metrics
- **Gemini AI**: Natural language insights and recommendations
- **Action Items**: Prioritized conservation recommendations
- **Confidence Metrics**: System reliability and agreement scores

### **Location Selector**
- **Custom Coordinates**: Manual latitude/longitude input
- **Current Location**: GPS-based automatic location detection
- **Popular Locations**: Preset environmental monitoring sites
- **Quick Actions**: One-click analysis for major cities
- **Location Types**: Cities, forests, oceans, deserts, arctic regions

### **Satellite Viewer**
- **Real Imagery**: ESRI World Imagery integration
- **CNN Overlay**: AI analysis results on satellite images
- **Image Details**: Metadata and source information
- **Interactive Controls**: Refresh and external map links

## 🌐 **Backend Integration**

### **API Endpoints**
- `GET /analyze?lat={lat}&lon={lon}` - Complete environmental analysis
- `GET /quick-scan?lat={lat}&lon={lon}` - Fast environmental check
- `GET /satellite-vision?lat={lat}&lon={lon}` - CNN satellite focus
- `GET /locations/popular` - Popular analysis locations
- `GET /health` - System status and health check

### **Real API Only**
- **No Mock Data**: Frontend connects directly to Flask backend
- **Error Handling**: Clear messages when backend is unavailable
- **Status Monitoring**: Real-time backend connectivity indicator
- **Requirement**: Flask server must be running on http://localhost:5000

## 🎨 **Design System**

### **Color Palette**
- **Primary Green**: `#22c55e` (Green 500)
- **Emerald Accent**: `#10b981` (Emerald 500)
- **Dark Background**: `#0f172a` (Slate 900)
- **Glass Effects**: Black/green with backdrop blur

### **Typography**
- **Primary**: Geist Sans (clean, modern)
- **Monospace**: Geist Mono (technical data)
- **Weights**: Light (300), Medium (500), Bold (700)

### **Components**
- **Cards**: Glass morphism with green borders
- **Buttons**: Gradient hover effects and scale transforms
- **Status Indicators**: Color-coded with animation states
- **Navigation**: Fixed header with backdrop blur

## 🚀 **Getting Started**

### **Installation**
```bash
cd nextjs-typescript-app
npm install
```

### **Development**
```bash
npm run dev
```
Application runs on `http://localhost:3000`

### **Build**
```bash
npm run build
npm start
```

## 🔧 **Configuration**

### **Environment Variables**
No environment variables required for frontend-only operation.

### **Backend Connection**
- **Base URL**: `http://localhost:5000` (Flask backend)
- **Timeout**: 10 seconds for API requests
- **Error Handling**: Clear messages when backend unavailable
- **Status Monitor**: Real-time backend connectivity indicator

## 📱 **Responsive Design**

### **Breakpoints**
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### **Adaptive Features**
- **Navigation**: Collapsible mobile menu
- **Dashboard**: Stacked layout on mobile
- **3D Hero**: Optimized for touch devices
- **FAB**: Touch-friendly quick actions

## 🎯 **User Experience**

### **Performance**
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js automatic optimization
- **Lazy Loading**: Components and images load on demand

### **Accessibility**
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Semantic HTML and ARIA labels
- **Color Contrast**: WCAG AA compliant color ratios

### **Interactions**
- **Smooth Animations**: 60fps transitions and effects
- **Loading States**: Visual feedback for all async operations
- **Error Boundaries**: Graceful error handling and recovery

## 🌟 **Notable Features**

### **3D Hero Animation**
- **Breathing Earth**: Organic scaling and rotation
- **Post-processing**: Bloom and ambient occlusion effects
- **Performance**: Optimized for 60fps on modern devices

### **Real-time Updates**
- **System Monitor**: 30-second health check intervals
- **Live Data**: Automatic refresh of environmental metrics
- **Status Indicators**: Visual feedback for all system states

### **Quick Actions**
- **FAB Menu**: Floating action button with location shortcuts
- **Current Location**: GPS-based automatic location detection
- **One-click Analysis**: Instant environmental assessment
- **Popular Locations**: Curated environmental monitoring sites

---

🎉 **Your AIVA frontend is a complete environmental intelligence dashboard with stunning visuals, real-time data, and seamless user experience!**