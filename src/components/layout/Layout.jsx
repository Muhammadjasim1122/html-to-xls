import { FileSpreadsheet } from 'lucide-react';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 support-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                                <FileSpreadsheet className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                DataExtractor
                            </span>
                        </div>
                        <nav className="flex gap-4">
                            <button className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                                Documentation
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {children}
            </main>

            <footer className="border-t border-slate-200 bg-white py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
                    <p>© {new Date().getFullYear()} DataExtractor. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
