# Class Roll Fusion

A comprehensive, modern attendance management system designed for educational institutions. Built with React, TypeScript, and Capacitor for cross-platform compatibility.

## Features

- **Student Management**: Add, edit, and organize student information with ease
- **Attendance Tracking**: Real-time attendance marking with intuitive interface
- **Class Organization**: Create and manage multiple classes and subjects
- **Exam Management**: Record and track student exam results
- **Data Export**: Export attendance and performance data to spreadsheets
- **Cross-Platform**: Works on web, iOS, and Android devices
- **Modern UI**: Glassmorphism design with responsive layout

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui components
- **Mobile**: Capacitor for native iOS/Android apps
- **State Management**: React hooks and local storage
- **Build Tools**: Vite, ESLint, TypeScript

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/festomanolo/class-roll-fusion.git
cd class-roll-fusion
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
```

### Mobile App Development

#### iOS
```bash
npx cap add ios
npx cap open ios
```

#### Android
```bash
npx cap add android
npx cap open android
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   └── ...             # Feature-specific components
├── pages/              # Page components
├── services/           # Business logic and API services
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
└── data/               # Static data and configurations
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ for educators worldwide
