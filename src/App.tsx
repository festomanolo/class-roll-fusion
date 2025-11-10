import { ToastProvider } from "@/components/ui/tiktok-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import "@/styles/apple-design-system.css";
import { useEffect } from "react";
import { DatabaseFactory } from "@/services/database/DatabaseFactory";
import { OfflineService } from "@/services/mobile/OfflineService";
import { NotificationService } from "@/services/mobile/NotificationService";

const queryClient = new QueryClient();

const App = () => {
  // Initialize services on app load
  useEffect(() => {
    const initServices = async () => {
      try {
        console.log('🚀 Initializing services...');

        // Initialize database with error handling
        try {
          await DatabaseFactory.getDatabase();
          console.log('✅ Database initialized');
        } catch (dbError) {
          console.error('❌ Database initialization failed:', dbError);
          // Continue without database - app will use localStorage fallback
        }

        // Initialize offline service
        try {
          await OfflineService.initialize();
          console.log('✅ Offline service initialized');
        } catch (offlineError) {
          console.error('❌ Offline service initialization failed:', offlineError);
        }

        // Initialize notifications (skip if Firebase not configured)
        try {
          await NotificationService.initialize();
          console.log('✅ Notification service initialized');
        } catch (notificationError) {
          console.warn('⚠️ Notification service initialization skipped (Firebase not configured):', notificationError);
          // This is expected if Firebase is not configured - continue without notifications
        }

        console.log('✅ Service initialization completed');

        // Hide splash screen after services are initialized
        setTimeout(() => {
          const splash = document.getElementById('splash-screen');
          if (splash) {
            splash.style.opacity = '0';
            splash.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => {
              splash.style.display = 'none';
            }, 500);
          }
        }, 2000);
      } catch (error) {
        console.error('❌ Critical service initialization error:', error);
      }
    };

    initServices();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <ToastProvider>
            <AuthGuard>
              {/* Splash Screen Overlay */}
              <div
                id="splash-screen"
                className="fixed inset-0 z-50 flex items-center justify-center bg-white"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <div className="text-center">
                  <div className="mb-8">
                    <img
                      src="/class-roll.png"
                      alt="Class Roll"
                      className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg"
                    />
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                    Class Roll
                  </h1>
                  <p className="text-white/80 text-lg drop-shadow">
                    Smart Classroom Management
                  </p>
                </div>
              </div>

              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/settings" element={<Settings />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </AuthGuard>
          </ToastProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
